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
      @person = Person.in(@state_code).find(params[:person])
      @question.person = @person
    end

    if params[:bill]
      @bill = Bill.in(@state_code).find(params[:bill])
      @question.bill = @bill
    end

    new!
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
      redirect_to question_path(@state_code, @question)
    else
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

  def collection
    @questions ||= end_of_association_chain
      .includes(:user)
      .page(params[:page] || 1)
  end

  def resource
    @question ||= Question.where(state: @state_code).find(params[:id])
  end
end
