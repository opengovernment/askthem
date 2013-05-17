class QuestionsController < ApplicationController
  FULL_NEW_QUESTION_STEPS = %w(recipient content sign_up confirm)

  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :index
  actions :index, :show, :new, :create

  before_filter :set_state_code, only: [:new, :create]

  def index
    index! do |format|
      format.js {render partial: 'page'}
    end
  end

  def show
    @user = User.new unless user_signed_in?
    show!
  end

  def new
    @step = relevant_steps.first
    session[:question_current_step] = @step
    @step_details = step_details

    session[:question_params] ||= { state: @state_code }
    @question = Question.new(session[:question_params])
    @question.user = user_signed_in? ? @user : User.new

    if params[:person]
      @person = Person.in(@state_code).find(params[:person])
      @question.person = @person
      session[:ask_person] = @person.id
    end

    new!
  end

  def create
    session[:question_params].deep_merge!(params[:question])
    @question = Question.new(session[:question_params])
    @person = @question.person
    @user = @question.user
    @step = session[:question_current_step]

    # TODO: step validation needs work
    if @step == relevant_steps.last
      if !user_signed_in? && @user.valid?
        @user.save
        @question.user = @user # necessary? check @question.user_id to see if it is updated without doing this
      end
      @question.save if @question.valid?
    else
      @step = next_step(@step)
      session[:question_current_step] = @step
    end

    @step_details = step_details

    if @question.new_record?
      create! do |format|
        format.html {render 'new'}
      end
    else
      # TODO: how are we handling flash messages?
      redirect_target = after_question_create_url
      clear_session_values_for_question
      redirect_to redirect_target
    end
  end

  private

  def set_state_code
    @state_code = parent.abbreviation
  end
  # steps may be different if...
  # user is logged in (no sign_up step)
  # person is passed in (no recipient step)
  def relevant_steps
    @relevant_steps ||= session[:steps] || FULL_NEW_QUESTION_STEPS
    @relevant_steps.delete('recipient') if params[:person]
    @relevant_steps.delete('sign_up') if user_signed_in?
    @relevant_steps
  end

  def next_step(current_step)
    relevant_steps[relevant_steps.index(current_step) + 1]
  end

  def step_details
    { name: @step,
      number: relevant_steps.index(@step) + 1,
      total: relevant_steps.size }
  end

  def to_clear_from_session
    [:question_params,
     :question_current_step,
     :ask_person,
     :steps]
  end

  def clear_session_values_for_question
   to_clear_from_session.each { |key| session[key] = nil }
  end

  def after_question_create_url
    go_to_person = if session[:ask_person].present?
                     Person.in(parent.abbreviation).find(session[:ask_person])
                   else
                     nil
                   end

    if go_to_person
      [go_to_person, { jurisdiction: parent.abbreviation }]
    else
      { action: :index }
    end
  end

  def end_of_association_chain
    Question.in(parent.abbreviation)
  end

  def collection
    @questions ||= Kaminari.paginate_array([stub] * 75).page(params[:page]) # @todo remove once we add some questions
    # end_of_association_chain.includes(:user).where(params.slice(:subject)).page(params[:page])
  end

  def resource # @todo remove once we add some questions
    @question ||= stub
  end

  def stub # @todo remove once we add some questions
    attributes = {
      title: 'What for dost doth under thy venerable name?',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu arcu augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras consequat, enim ac suscipit convallis, sem ligula molestie sem, nec adipiscing nulla leo id lacus. Donec in orci sed erat blandit ornare. Nunc non quam sit amet quam suscipit tristique sed a velit. Nunc cursus pellentesque lectus a tincidunt. Nam blandit, mi ac suscipit lobortis, mauris purus vulputate dui, ac volutpat sapien nibh nec nisl. Duis faucibus rutrum placerat. Pellentesque semper laoreet nisl eget hendrerit. Aliquam erat volutpat. Morbi ligula augue, vehicula ut fermentum in, porttitor sit amet sem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Phasellus eu varius tellus. Maecenas neque sem, egestas id venenatis nec, aliquam congue felis.',
      state: parent.abbreviation,
      subject: 'Health',
      user: User.first,
      person: Person.in(parent.abbreviation).last,
      issued_at: 1.week.ago,
    }

    bill = Bill.in(parent.abbreviation).last
    if bill
      attributes.merge!({
        bill: bill,
        bill_id: bill.id,
      })
    end

    Question.new(attributes)
  end

end
