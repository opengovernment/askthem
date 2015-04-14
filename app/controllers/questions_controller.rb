class QuestionsController < ApplicationController
  before_filter :force_http

  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :index
  respond_to :json, only: [:create]
  actions :index, :show, :new, :create, :edit, :update, :destroy
  custom_actions resource: [:need_signatures, :have_answers, :need_answers, :recent]

  before_filter :set_state_code, only: [:show, :new, :create, :need_signatures,
                                        :have_answers, :need_answers, :recent,
                                        :edit, :update, :destroy]
  before_filter :set_question_person_id, only: :create
  before_filter :set_is_unaffiliated, only: [:index, :show, :need_signatures,
                                             :have_answers, :need_answers, :recent]
  before_filter :redirect_to_unaffiliated_route_if_necessary, only: [:index, :show]
  before_filter :authenticate_user!, only: [:edit, :destroy, :update]
  before_filter :check_can_manage_question, only: [:edit, :destroy, :update]
  before_filter :set_person, only: [:index, :need_signatures, :have_answers,
                                    :need_answers, :recent]
  before_filter :set_is_national, only: [:index, :need_signatures, :have_answers,
                                         :need_answers, :recent]

  # in case new was a post
  after_filter :store_location_for_new_question, only: [:new]
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
    @questions = end_of_association_chain.any_in(id: Answer.all.distinct("question_id"))
      .includes(:user)
      .page(page)
    tab "have_answers"
  end

  def need_answers
    @questions = end_of_association_chain.where(threshold_met: true)
      .not_in(id: Answer.all.distinct("question_id"))
      .includes(:user)
      .page(page)
    tab "need_answers"
  end

  def recent
    @questions = end_of_association_chain.desc(:created_at)
      .includes(:user)
      .page(page)
    tab "recent"
  end

  def show
    @user = user_signed_in? ? current_user : User.new
    if params[:code]
      confirmed_question = Question.where(id: params[:id])
                           .where(confirm_code: params[:code]).first
      if confirmed_question
        confirmed_question.update_attributes({ needs_confirmation: false })
        flash[:notice] = "Thanks for confirming! Your question is now live!"
      else
        raise "unauthorized access"
      end
    end

    show! do
      @recent_signatures = @question.signatures
        .includes(:user)
        .where(:user_id.nin => [@question.user_id])
        .desc(:created_at).limit(5)
    end

  rescue Mongoid::Errors::DocumentNotFound => error
    question_different_jurisdiction = Question.where(id: params[:id])
                                      .in(needs_confirmation: [nil, false]).first

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

    if session[:question_skeleton]
      sanitized_title = ActionController::Base.helpers.strip_tags(session[:question_skeleton][:title])
      @question.title = sanitized_title
      @question.body = session[:question_skeleton][:body]
    end

    if session[:referring_partner_info].present?
      @from_partner = true
      @referring_partner_info = session[:referring_partner_info]
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

    partner = session[:referring_partner_info] || params[:partner]
    if partner.present? && @user
      existing_user = User.where(email: @question.user.email).first

      # if we have an existing user and that user has a working email
      # update question params w/ existing user
      # if they have bouncing email, they will fail validation as they should
      if existing_user && !existing_user.email_is_disabled?
        @question.user = existing_user
        @question.needs_confirmation = true
        @question.confirm_code = SecureRandom.urlsafe_base64
        @user = existing_user
      else
        @user.referring_partner_info = partner
        @user.set_attributes_based_on_partner
      end
    end

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

      question_url = question_path(@question.state, @question, share: true)
      respond_to do |format|
        format.html do
          set_referring_partner_flash_if_necessary_for(@user)

          sign_in @user

          redirect_to question_url
        end
        format.json { render json: {
            question: { url: question_url }
          }, :status => :created}
      end
    else
      respond_to do |format|
        format.html do
          set_up_steps

          if @question.person_id.blank?
            # TODO: email details of question to staff so they may follow up with user
            flash[:alert] = "Recipient not available due to an error. Staff are looking into it. Please try again later."
          else
            flash[:alert] = "Whoops! Not quite right. Please try again."
          end

          render "new", layout: "data_collection"
        end
        format.json { render json: @question.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    set_up_steps

    @question = Question.connected_to(@state_code).find(params[:id])
    @user = @question.user
    @bill = @question.bill
    @person = @question.person

    render layout: "data_collection"
  end

  def update
    update!(notice: "Question updated") do |format|
      format.html { redirect_to question_path(@question.state, @question) }
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
                   ["Councilmember", "Mayor"]
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
    if %w(edit update).include?(params[:action])
      return @relevant_steps = ["content"]
    end

    @relevant_steps = %w(recipient content sign_up confirm)
    @relevant_steps.delete("recipient") if params[:person]
    @relevant_steps.delete("sign_up") if user_signed_in?
    @relevant_steps
  end

  def end_of_association_chain
    abbreviation = parent.abbreviation
    return Question if abbreviation == Metadatum::Us::ABBREVIATION

    person_ids = if @person
                   [@person.id]
                 else
                   Person.only_types(types).connected_to(abbreviation).collect(&:id)
                 end
    Question.connected_to(abbreviation).in(person_id: person_ids)
      .in(needs_confirmation: [nil, false])
  end

  def collection
    @questions ||= end_of_association_chain
      .includes(:user)
      .page(params[:page] || 1)
  end

  def resource
    @question ||= Question.where(state: @state_code)
      .in(needs_confirmation: [nil, false]).find(params[:id])
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

      path = if params[:action] == "index"
               unaffiliated_questions_path
             else
               unaffiliated_question_path(params[:id], share: params[:share])
             end
      redirect_to path
    end
  end

  def check_can_manage_question
    unless current_user.can?(:manage_question)
      raise Authority::SecurityViolation.new(current_user,
                                             :manage_question,
                                             QuestionsController)
    end
  end

  def set_person
    if params[:person]
      @person = Person.connected_to(parent.abbreviation).find(params[:person])
    end
  end

  def set_is_national
    @is_national = params[:jurisdiction] == Metadatum::Us::ABBREVIATION
  end

  def set_referring_partner_flash_if_necessary_for(user)
    info = user.referring_partner_info

    if info && info[:name].present? && info[:return_url].present?
      message = "Thanks for your question!"
      message += " You can keep checking out AskThem.io or"
      message += " return to"
      message += " <a href=\"#{info[:return_url]}\">#{info[:name]}</a>."
      flash[:notice] = message
    end
  end

  def store_location_for_new_question
    session[:previous_url] = request.fullpath
  end
end
