class PeopleController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: [:show, :bills, :committees, :votes, :ratings]
  actions :index, :show
  custom_actions resource: [:bills, :committees, :votes, :ratings]

  def show
    @questions = resource.questions.page(params[:page])
    tab 'questions'
  end

  def bills
    @bills = resource.bills.recent.includes(:questions).page(params[:page]) # no index includes `session`, so we omit it
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
  def type
    @type ||= params[:type] || 'Person'
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
    @people ||= end_of_association_chain.active.includes(:questions)
      .only_type(type)
  end
end
