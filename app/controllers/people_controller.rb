class PeopleController < ApplicationController
  before_filter :force_http

  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: [:show, :bills, :committees, :votes, :ratings]
  actions :index, :show
  custom_actions resource: [:bills, :committees, :votes, :ratings]

  before_filter :set_is_unaffiliated, only: [:index, :show]
  before_filter :redirect_to_unaffiliated_route_if_necessary, only: [:index, :show]

  def show
    @questions = resource.questions.includes(:user).page(params[:page])
    tab 'questions'

  rescue Mongoid::Errors::DocumentNotFound => error
    if @is_unaffiliated
      raise error
    else
      redirect_to unaffiliated_person_path(params[:id])
    end
  end

  def bills
    # @bills = resource.bills.recent.includes(:questions).page(params[:page]) # no index includes `session`, so we omit it
    # if we allow questions on bills again, reinstate includes
    @bills = resource.bills.recent.page(params[:page]) # no index includes `session`, so we omit it
    tab 'bills'
  end

  def committees
    @committees = resource.committees
    tab 'committees'
  end

  def votes
    @votes = resource.votes.page(params[:page])
    tab 'votes'
  end

  def ratings
    @ratings = resource.ratings
    tab 'ratings'
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
      format.html {render action: 'show'}
      format.js {render partial: @tab}
    end
  end

  def end_of_association_chain
    Person.connected_to(parent.abbreviation)
  end

  def collection
    # downcase covers api legacy set 'person' for _type
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
end
