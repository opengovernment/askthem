class PeopleController < ApplicationController
  inherit_resources
  respond_to :html
  respond_to :js, only: [:show, :bills, :committees, :votes]
  actions :index, :show
  custom_actions resource: [:bills, :committees, :votes]

  before_filter :set_jurisdiction

  def show
    tab 'questions'
  end

  def bills
    tab 'bills'
  end

  def committees
    tab 'committees'
  end

  def votes
    tab 'votes'
  end

private

  def tab(tab)
    show! do |format|
      @tab = tab
      format.html {render action: 'show'}
      format.js {render partial: @tab}
    end
  end

  def collection
    @people ||= end_of_association_chain.where(state: @jurisdiction.id, active: true).asc(:chamber, :family_name)
  end
end
