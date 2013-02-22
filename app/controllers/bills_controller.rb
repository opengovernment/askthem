class BillsController < ApplicationController
  inherit_resources
  respond_to :html
  actions :index, :show

  before_filter :set_jurisdiction

private

  def collection
    @bills ||= end_of_association_chain.where(state: @jurisdiction.id).page(params[:page])
  end
end
