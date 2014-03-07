class AnswersController < ApplicationController
  before_filter :force_http

  respond_to :html
  before_filter :authenticate_user!
  before_filter :check_can_manage_question, only: :update

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

      QuestionAnsweredNotifierWorker.perform_async(question.id.to_s)

      redirect_to question_path(question.state, question.id)
    end
  end

  def update
    answer = Answer.find(params[:id])

    if answer.update_attributes(params[:answer])
      redirect_to question_path(answer.question.state, answer.question.id)
    end
  end

  private
  def check_can_manage_question
    unless current_user.can?(:manage_question)
      raise Authority::SecurityViolation.new(current_user,
                                             :manage_question,
                                             AnswersController)
    end
  end
end
