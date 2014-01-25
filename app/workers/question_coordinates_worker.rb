class QuestionCoordinatesWorker
  include Sidekiq::Worker

  # user may not have coordinates yet, try until they do
  def perform(id)
    question = Question.find(id)
    user = question.user

    if user && question.coordinates.blank?
      if user.coordinates.present?
        question.coordinates = user.coordinates
        question.save!
      else
        self.class.perform_in(10.minutes, id)
      end
    end

  rescue Mongoid::Errors::DocumentNotFound
    logger.info "Question: #{id} appears to have been deleted"
  end
end
