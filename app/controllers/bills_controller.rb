class BillsController < ApplicationController
  inherit_resources
  respond_to :html
  actions :index, :show

  before_filter :set_jurisdiction

private

  def collection
    @bills ||= end_of_association_chain.where(state: @jurisdiction.id, _current_session: true).desc('action_dates.last').page(params[:page])
  end
end
