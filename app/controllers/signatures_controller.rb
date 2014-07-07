class SignaturesController < ApplicationController
  before_filter :force_http

  respond_to :json, except: [:index]
  respond_to :csv, only: [:index]

  before_filter :authenticate_user!
  before_filter :check_can_view_signatures, only: :index

  def index
    signer_ids = Signature.where(question_id: params[:question_id])
      .collect(&:user_id)
    @signers = User.in(id: signer_ids)
  end

  def create
    @signature = current_user.signatures.new(question_id: params[:question_id])

    if @signature.save
      question = Question.find(params[:question_id])
      QuestionMailer.signed_on(current_user, question).deliver

      if question.signature_count == question.person.signature_threshold
        QuestionMailer.email_person(question).deliver
        QuestionMailer.notify_staff_question_at_threshold(question).deliver
      end

      render json: @signature, status: :created
    else
      render json: @signature.errors, status: :unprocessable_entity
    end
  end

  private
  def check_can_view_signatures
    unless current_user.can?(:view_signatures)
      raise Authority::SecurityViolation.new(current_user,
                                             :view_signatures,
                                             SignaturesController)
    end
  end
end
