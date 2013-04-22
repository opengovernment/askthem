class QuestionsController < ApplicationController
  inherit_resources
  respond_to :html
  actions :index, :show, :new
  custom_actions resource: :preview

  before_filter :set_jurisdiction

  def show
    # @todo stub
  end

  def preview
    # @todo stub
  end

private

  def collection
    @questions ||= end_of_association_chain # @todo limit to jurisdiction
  end
end
