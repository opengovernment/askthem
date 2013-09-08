class AnswersController < ApplicationController
  respond_to :html
  before_filter :authenticate_user!

  def create
    question = Question.find(params[:question_id])
    if current_user.has_role?(:responder, question.person)
      answer = Answer.new(text: params[:answer][:text],
                          user: current_user,
                          question: question)
      if answer.save!
        question.answers << answer
        question.save
      end
      redirect_to question_path(question.state, question.id)
    end
  end
end
