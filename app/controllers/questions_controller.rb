class QuestionsController < ApplicationController
  inherit_resources
  respond_to :html
  actions :index, :show, :new

  before_filter :set_jurisdiction

  def show
    # @todo stub
  end

private

  def collection
    @questions ||= end_of_association_chain # @todo limit to jurisdiction
  end
end
