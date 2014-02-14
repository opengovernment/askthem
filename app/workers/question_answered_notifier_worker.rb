class QuestionAnsweredNotifierWorker
  include Sidekiq::Worker

  attr_accessor :question

  def perform(id)
    self.question = Question.find(id)
    return unless question.answered?

    notify_everyone_interested
  rescue Mongoid::Errors::DocumentNotFound
    logger.info "Question: #{id} appears to have been deleted"
  end

  private
  def notify_everyone_interested
    # QuestionMailer.answered_for_author(question.user, question).deliver

    # question.signatures.collect(&:user).each do |user|
    #   unless user = question.user
    #    QuestionMailer.answered_for_signer(user, question).deliver
    #  end
    # end

    QuestionMailer.notify_staff_members_answered(question).deliver
  end
end
