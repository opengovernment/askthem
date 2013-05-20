class QuestionsController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :index
  actions :index, :show, :new, :create

  before_filter :set_state_code, only: [:show, :new, :create]

  def index
    index! do |format|
      format.js {render partial: 'page'}
    end
  end

  def show
    @user = user_signed_in? ? current_user : User.new
    show!
  end

  def new
    set_up_steps
    @question = Question.new(state: @state_code)
    @question.user = user_signed_in? ? current_user : User.new

    if params[:person]
      logger.info "what is @state_code: #{@state_code}"
      logger.info "what is params[:person]: #{params[:person]}"
      @person = Person.in(@state_code).find(params[:person])
      @question.person = @person
    end

    new!
  end

  # TODO: add validation to view and UX
  def create
    @question = Question.new(params[:question])
    @question.state = @state_code
    # TEMP: our handed code subjects are not consistent as foreign keys
    # against bills for jurisdiction
    # TODO: remove this when subject is sorted out
    @question.subject = nil
    @person = @question.person if @question.person_id.present?
    @user = @question.user

    @user.save if !user_signed_in? && @user.valid?

    if @question.save
      redirect_to question_path(@state_code, @question)
    else
      logger.debug "what are @question.errors: #{@question.errors.inspect}"
      logger.debug "what are @question.user.errors: #{@question.user.errors.inspect}"
      set_up_steps
      respond_to do |format|
        format.html { render 'new' }
      end
    end
  end

  private

  def set_state_code
    @state_code = parent.abbreviation
  end

  def set_up_steps
    @first_step = relevant_steps.first
  end

  # steps may be different if...
  # user is logged in (no sign_up step)
  # person is passed in (no recipient step)
  def relevant_steps
    @relevant_steps = %w(recipient content sign_up confirm)
    @relevant_steps.delete('recipient') if params[:person]
    @relevant_steps.delete('sign_up') if user_signed_in?
    @relevant_steps
  end

  def end_of_association_chain
    Question.in(parent.abbreviation)
  end

  def collection
    @questions ||= Kaminari.paginate_array([stub] * 75).page(params[:page]) # @todo remove once we add some questions
    # end_of_association_chain.includes(:user).where(params.slice(:subject)).page(params[:page])
  end

  def resource
    @question ||= Question.where(state: @state_code).find(params[:id])
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
