class PeopleController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: [:show, :bills, :committees, :votes, :ratings]
  actions :index, :show
  custom_actions resource: [:bills, :committees, :votes, :ratings]

  def show
    @questions = resource.questions.includes(:user).page(params[:page])
    tab 'questions'
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
  def type
    @type ||= if params[:type]
                params[:type]
              else
                if @jurisdiction.abbreviation.include?("-")
                  "Councilmember"
                else
                  "StateLegislator"
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
    @people ||= end_of_association_chain.active.includes(:questions, :identities)
      .only_type(type)
  end
end
