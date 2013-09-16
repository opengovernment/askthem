class UsersController < ApplicationController
  inherit_resources
  respond_to :html
  actions :show
  custom_actions resource: [:questions, :signatures]

  def show
    @questions = resource.questions.includes(:user)
    tab 'questions'
  end

  def signatures
    @signatures = resource.signatures
    tab 'signatures'
  end

  private

  def tab(tab)
    @tab = tab
    show! do |format|
      format.html { render action: 'show' }
      format.js { render partial: @tab }
    end
  end
end
