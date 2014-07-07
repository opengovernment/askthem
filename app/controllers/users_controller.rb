class UsersController < ApplicationController
  before_filter :force_http

  inherit_resources
  respond_to :html
  actions :show, :update
  custom_actions resource: [:questions, :signatures]

  before_filter :authenticate_user!, only: [:update]
  before_filter :check_can_manage_user, only: :update

  def show
    @questions = resource.questions.includes(:user).page(params[:page])
    tab "questions"
  end

  def signatures
    @signatures = resource.signatures.page(params[:page])
    tab "signatures"
  end

  private

  def tab(tab)
    @tab = tab
    show! do |format|
      format.html { render action: "show" }
      format.js { render partial: @tab }
    end
  end

  def check_can_manage_user
    unless current_user.can?(:manage_user)
      raise Authority::SecurityViolation.new(current_user,
                                             :manage_user,
                                             UsersController)
    end
  end
end
