class CommitteesController < ApplicationController
  inherit_resources
  respond_to :html
  actions :index, :show

  before_filter :set_jurisdiction

  def show
    show! do
      @bills = @committee.bills.page(params[:page])
    end
  end

private

  def collection
    @committees ||= end_of_association_chain.where(state: @jurisdiction.id)
  end
end
