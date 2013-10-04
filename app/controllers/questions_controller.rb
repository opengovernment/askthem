class QuestionsController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :index
  actions :index, :show, :new, :create

  before_filter :set_state_code, only: [:show, :new, :create]

  def index
    index! do |format|
      if params[:need_signatures] == 'true'
        @questions = Question.where(:signature_count.gt =>1 )
          .includes(:user)
          .page(params[:page] || 1)
      end
      format.js { render partial: "page" }
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
      @person = Person.connected_to(@state_code).find(params[:person])
      @question.person = @person
    end

    if params[:bill]
      @bill = Bill.connected_to(@state_code).find(params[:bill])
      @question.bill = @bill
    end

    render layout: "data_collection"

    # new!
  end

  def create
    @question = Question.new(params[:question])
    @question.state = @state_code
    @person = @question.person if @question.person_id.present?
    @user = @question.user

    # mongoid nested user
    # saving doesn't prevent question saving for belongs_to
    # when user is invalid, thus we split it up
    if @question.valid? && (user_signed_in? || @user.valid?)
      @question.save
      QuestionMailer.question_posted(@user, @question).deliver
      redirect_to question_path(@state_code, @question, :created => true)
    else
      set_up_steps
      respond_to do |format|
        format.html { render "new" }
      end
    end
  end

  private
  def type
    @type ||= params[:type] || "Person"
  end

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
    @relevant_steps.delete("recipient") if params[:person]
    @relevant_steps.delete("sign_up") if user_signed_in?
    @relevant_steps
  end

  # @todo: questions are currently always created in default session
  # rather than session of owning metadatum
  # which can lead to unexpected results when using "in" query
  # unify databases or make consistent
  def end_of_association_chain
    abbreviation = parent.abbreviation
    person_ids = Person.only_type(type).connected_to(abbreviation).collect(&:id)
    Question.connected_to(abbreviation).in(person_id: person_ids)
  end

  def collection
    @questions ||= end_of_association_chain
      .includes(:user)
      .page(params[:page] || 1)
  end

  def resource
    @question ||= Question.where(state: @state_code).find(params[:id])
  end

end
