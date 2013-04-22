class BillsController < ApplicationController
  inherit_resources
  respond_to :html
  respond_to :js, only: [:show, :sponsors]
  actions :index, :show
  custom_actions resource: :sponsors

  before_filter :set_jurisdiction

  def show
    tab 'questions'
  end

  def sponsors
    tab 'sponsors'
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
    @bills ||= end_of_association_chain.where(state: @jurisdiction.id, _current_session: true).desc('action_dates.last').page(params[:page]) # @todo not available in API?
  end
end
