class QuestionsController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  actions :index, :show, :new, :create
  custom_actions resource: :preview

  def show
    @question = Question.new(title: 'What for dost doth under thy venerable name?', state: @jurisdiction['abbreviation']) # @todo stub
    @user = User.new unless user_signed_in?
  end

  def preview
    # @todo stub
  end
end
