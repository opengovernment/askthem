class QuestionsController < ApplicationController
  before_filter :force_http

  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :index
  actions :index, :show, :new, :create, :destroy
  custom_actions resource: [:need_signatures, :have_answers, :need_answers, :recent]

  before_filter :set_state_code, only: [:show, :new, :create, :need_signatures,
                                        :have_answers, :need_answers, :recent,
                                        :destroy]
  before_filter :set_question_person_id, only: :create
  before_filter :set_is_unaffiliated, only: [:index, :show]
  before_filter :redirect_to_unaffiliated_route_if_necessary, only: [:index, :show]
  before_filter :authenticate_user!, only: [:destroy]
  before_filter :check_can_destroy_question, only: :destroy

  def index
    index! do |format|
      format.js { render partial: "page" }
    end
  end

  def need_signatures
    @questions = end_of_association_chain.where(threshold_met: false)
      .includes(:user)
      .page(page)
    tab "need_signatures"
  end

  def have_answers
    @questions = end_of_association_chain.any_in(_id: Answer.all.distinct("question_id"))
      .includes(:user)
      .page(page)
    tab "have_answers"
  end

  def need_answers
    @questions = end_of_association_chain.not_in(_id: Answer.all.distinct("question_id"))
      .includes(:user)
      .page(page)
    tab "need_answers"
  end

  def recent
    @questions = end_of_association_chain.desc(:issued_at)
      .includes(:user)
      .page(page)
    tab "recent"
  end

  def show
    @user = user_signed_in? ? current_user : User.new
    show! do
      @recent_signatures = @question.signatures
        .includes(:user)
        .where(:user_id.nin => [@question.user_id])
        .order_by(created_at: "DESC").limit(5)
    end

  rescue Mongoid::Errors::DocumentNotFound => error
    question_different_jurisdiction = Question.where(id: params[:id]).first

    if question_different_jurisdiction
      correct_jurisdiction = question_different_jurisdiction.state
      if correct_jurisdiction == Metadatum::Unaffiliated::ABBREVIATION
        redirect_to unaffiliated_question_path(params[:id], share: params[:share])
      else
        redirect_to question_path(correct_jurisdiction, params[:id], share: params[:share])
      end
    else
      raise error
    end
  end

  def new
    set_up_steps
    @question = Question.new(state: @state_code)
    @question.user = user_signed_in? ? current_user : User.new
    @question.user.for_new_question = true

    if params[:person]
      @person = Person.find(params[:person])
      @question.person = @person
    end

    if params[:bill]
      @bill = Bill.connected_to(@state_code).find(params[:bill])
      @question.bill = @bill
    end

    render layout: "data_collection"
  end

  def create
    @question = Question.new(params[:question])
    if @question.person_id.present?
      @person = @question.person
      @question.state = @person.state
    else
      @question.state = @state_code
    end
    @user = @question.user

    # mongoid nested user
    # saving doesn't prevent question saving for belongs_to
    # when user is invalid, thus we split it up
    if @question.valid? && (user_signed_in? || @user.valid?)
      @question.save
      QuestionMailer.question_posted(@user, @question).deliver

      if @question.state == Metadatum::Unaffiliated::ABBREVIATION &&
          @person.questions.count < 2
        PersonMailer.notify_staff_new_from_twitter(@person).deliver
      end

      redirect_to question_path(@question.state, @question, share: true)
    else
      set_up_steps

      if @question.person_id.blank?
        flash.now[:alert] = "Recipient not available due to an error. Staff are looking into it. Please try again later."
      else
        flash.now[:alert] = "Whoops! Not quite right. Please try again."
      end

      respond_to do |format|
        format.html { render "new", layout: "data_collection" }
      end
    end
  end

  private
  def page
    params[:page] || 1
  end

  def types
    @gov = params[:gov]
    @types ||= if @gov
                 case @gov
                 when "state"
                   ["StateLegislator", "Governor"]
                 when "federal"
                   ["FederalLegislator"]
                 end
               elsif @is_unaffiliated
                 ["Person"]
               else
                 if @jurisdiction && @jurisdiction.abbreviation.include?("-")
                   ["Councilmember"]
                 else
                   @gov = "federal"
                   ["FederalLegislator"]
                 end
               end
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
    person_ids = Person.only_types(types).connected_to(abbreviation).collect(&:id)
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

  private
  def tab(tab)
    @tab = tab
    index! do |format|
      format.html { render action: "index" }
      format.js { render partial: "page" }
    end
  end

  def set_question_person_id
    person_id = params[:question][:person_id]
    return unless person_id

    unless Person.where(id: person_id).count > 0
      person_id = person_id_from_cached_official(person_id)
    end

    params[:question][:person_id] = person_id
  end

  def person_id_from_cached_official(id)
    cached_official = CachedOfficial.where(id: id).first
    return cached_official.person.id if cached_official && cached_official.person

    # alert staff cached_official failed to match a person
    if cached_official
      PersonMailer.notify_staff_bad_person(cached_official).deliver
    end

    nil
  end

  def set_is_unaffiliated
    @is_unaffiliated = params[:jurisdiction] ==
      Metadatum::Unaffiliated::ABBREVIATION
  end

  def redirect_to_unaffiliated_route_if_necessary
    if request.fullpath.include?(Metadatum::Unaffiliated::ABBREVIATION)
      logger.debug("in redirect and matching fullpath")
      path = if params[:action] == "index"
               unaffiliated_questions_path
             else
               unaffiliated_question_path(params[:id], share: params[:share])
             end
      redirect_to path
    end
  end

  def check_can_destroy_question
    unless current_user.can?(:destroy_question)
      raise Authority::SecurityViolation.new(current_user,
                                             :destroy_question,
                                             QuestionsController)
    end
  end
end
