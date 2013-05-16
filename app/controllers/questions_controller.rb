class QuestionsController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :index
  actions :index, :show, :new, :create

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
    @step = params[:step].try(&:to_i) || 1
    session[:question_current_step] = @step
    session[:question_params] ||= { state: parent.abbreviation }
    @question = Question.new(session[:question_params])

    if params[:person] && @step == 1
      @person = Person.in(parent.abbreviation).find(params[:person])
      @question.person = @person
      session[:ask_person] = @person.id
    end

    new!
  end

  def create
    session[:question_params].deep_merge!(params[:question])
    @question = Question.new(session[:question_params])
    @person = @question.person
    @step = session[:question_current_step]

    # TODO: user handling
    # temp hack for step 4
    @question.user = User.first || User.new

    # TODO: step validation needs work
    if @step == 4 && @question.valid?
      @question.save
    else
      @step += 1 unless @step == 4
      session[:question_current_step] = @step
    end

    if @question.new_record?
      create! do |format|
        format.html {render 'new'}
      end
    else
      # TODO: how are we handling flash messages?

      go_to_person = session[:ask_person].present? ? Person.in(parent.abbreviation).find(session[:ask_person]) : nil

      to_be_cleared = [:question_params, :question_current_step, :ask_person]
      to_be_cleared.each do |key|
        session[key] = nil
      end

      if go_to_person
        redirect_to go_to_person, jurisdiction: parent.abbreviation
      else
        redirect_to action: :index
      end
    end
  end

private

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
