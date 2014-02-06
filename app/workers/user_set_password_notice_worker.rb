class UserSetPasswordNoticeWorker
  include Sidekiq::Worker

  attr_accessor :user

  # tidy up unaffiliated people that don't have questions
  # meant to be scheduled at a given period after they are created
  def perform(id)
    self.user = User.find(id)
    notify_or_reschedule if user.password_is_placeholder?

  rescue Mongoid::Errors::DocumentNotFound
    logger.info "User: #{id} appears to have been deleted"
  end

  private
  def notify_or_reschedule
    if user.confirmed?
      user.send_reset_password_instructions
      user.password_is_placeholder = false
      user.save!
    else
      self.class.perform_in(60.minutes, user.id)
    end
  end
end
