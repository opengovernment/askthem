class QuestionsController < ApplicationController
  inherit_resources
  respond_to :html
  actions :index, :show, :new
  custom_actions resource: :preview

  before_filter :set_jurisdiction

  def show
    @question = Question.new(title: 'What for dost doth under thy venerable name?') # @todo stub
    @user = User.new unless user_signed_in?
  end

  def preview
    # @todo stub
  end

private

  def collection
    @questions ||= end_of_association_chain # @todo limit to jurisdiction
  end
end
