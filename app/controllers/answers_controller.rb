class AnswersController < ApplicationController
  respond_to :html
  before_filter :authenticate_user!

  def create
    question = Question.find(params[:question_id])
    if current_user.has_role?(:responder, question.person)
      answer = Answer.create!(text: params[:answer][:text], question_id: question.id)
      redirect_to question_path(question.state, question.id)
    end
  end
end

