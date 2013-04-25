class BillsController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, param: :jurisdiction
  respond_to :html
  respond_to :js, only: [:index, :show, :sponsors]
  actions :index, :show
  custom_actions resource: :sponsors

  def index
    index! do |format|
      format.js {render partial: 'page'}
    end
  end

  def show
    tab 'questions'
  end

  def sponsors
    tab 'sponsors'
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
    @bills ||= end_of_association_chain.where({
      state: @jurisdiction.id,
      session: @jurisdiction.current_session,
    }).desc('action_dates.last').page(params[:page])
  end
end
