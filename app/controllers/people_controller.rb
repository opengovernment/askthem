class PeopleController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, param: :jurisdiction
  respond_to :html
  respond_to :js, only: [:show, :bills, :committees, :votes]
  actions :index, :show
  custom_actions resource: [:bills, :committees, :votes]

  def show
    tab 'questions'
  end

  def bills
    @bills = resource.bills.page(params[:page])
    tab 'bills'
  end

  def committees
    @committees = resource.committees
    tab 'committees'
  end

  def votes
    tab 'votes'
  end

private

  def tab(tab)
    @tab = tab
    show! do |format|
      format.html {render action: 'show'}
      format.js {render partial: @tab}
    end
  end

  def collection
    @people ||= end_of_association_chain.where({
      state: @jurisdiction.id,
      active: true,
    }).asc(:chamber, :family_name)
  end
end
