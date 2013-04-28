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

  def tab(tab)
    @tab = tab
    show! do |format|
      format.html {render action: 'show'}
      format.js {render partial: @tab}
    end
  end

  def end_of_association_chain
    Person.in(parent.abbreviation)
  end

  def collection
    @people ||= end_of_association_chain.active.includes(:questions)
  end
end
