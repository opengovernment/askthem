class PeopleController < ApplicationController
  before_filter :force_http

  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: [:show, :bills, :committees, :votes, :ratings]
  actions :index, :show, :update
  custom_actions resource: [:bills, :committees, :votes, :ratings]

  before_filter :set_is_unaffiliated, only: [:index, :show]
  before_filter :redirect_to_unaffiliated_route_if_necessary, only: [:index, :show]

  before_filter :authenticate_user!, only: :update
  before_filter :check_can_manage_person, only: :update

  def show
    @blurb = Blurb.active.where(target_url: person_path(parent, resource)).first
    @questions = resource.questions.in(needs_confirmation: [nil, false])
                 .includes(:user).desc(:created_at).page(params[:page])
    tab "questions"

  rescue Mongoid::Errors::DocumentNotFound => error
    person_different_jurisdiction = Person.where(id: params[:id]).first

    if person_different_jurisdiction
      correct_jurisdiction = person_different_jurisdiction.state
      if correct_jurisdiction == Metadatum::Unaffiliated::ABBREVIATION
        redirect_to unaffiliated_person_path(params[:id], share: params[:share])
      else
        redirect_to person_path(correct_jurisdiction, params[:id], share: params[:share])
      end
    else
      raise error
    end
  end

  def bills
    # @bills = resource.bills.recent.includes(:questions).page(params[:page]) # no index includes `session`, so we omit it
    # if we allow questions on bills again, reinstate includes
    @bills = resource.bills.recent.page(params[:page]).per(10) # no index includes `session`, so we omit it
    tab "bills"
  end

  def committees
    # committees trigger a lot of subqueries, only do 5 per page
    @committees = resource.committees.page(params[:page]).per(5)
    tab "committees"
  end

  def votes
    @votes = resource.votes.page(params[:page])
    tab "votes"
  end

  def ratings
    @ratings = resource.ratings.page(params[:page])
    tab "ratings"
  end

  def update
    @person = Person.find(params[:id])
    params[:person] = params[@person.class.name.tableize.singularize.to_sym]
    update!(notice: "Person updated") do |format|
      format.html { redirect_to person_path(@person.state, @person) }
    end
  end

  private
  # @todo DRY with pages controller and improve
  # putting off, because it will likely be totally replaced
  def types
    @types ||= if params[:gov]
                @gov = params[:gov]
                 case @gov
                 when "state"
                   ["StateLegislator"]
                 when "federal"
                   ["FederalLegislator"]
                 end
               elsif @is_unaffiliated
                 ["Person"]
               else
                 if @jurisdiction && @jurisdiction.abbreviation.include?("-")
                   ["Councilmember"]
                 else
                   ["FederalLegislator"]
                 end
               end
  end

  def tab(tab)
    @tab = tab
    show! do |format|
      format.html { render action: "show" }
      format.js { render partial: @tab }
    end
  end

  def end_of_association_chain
    Person.connected_to(parent.abbreviation)
  end

  def collection
    # downcase covers api legacy set "person" for _type
    # @todo evaluate if in for type is too slow
    @people ||= begin
                  people = end_of_association_chain.includes(:questions, :identities)
                  unless @is_unaffiliated
                    people = people.active
                  end
                  people.only_types(types)
                end
  end

  def set_is_unaffiliated
    @is_unaffiliated = params[:jurisdiction] ==
      Metadatum::Unaffiliated::ABBREVIATION
  end

  def redirect_to_unaffiliated_route_if_necessary
    if request.fullpath.include?(Metadatum::Unaffiliated::ABBREVIATION)
      path = if params[:action] == "index"
               unaffiliated_people_path
             else
               unaffiliated_person_path(params[:id])
             end
      redirect_to path
    end
  end

  def check_can_manage_person
    unless current_user.can?(:manage_person)
      raise Authority::SecurityViolation.new(current_user,
                                             :manage_person,
                                             PeopleController)
    end
  end
end
