class UserSetPasswordNoticeWorker
  include Sidekiq::Worker

  attr_accessor :user

  def perform(id)
    self.user = User.find(id.to_s)

    if user.password_is_placeholder? && !user.email_is_disabled?
      notify_or_reschedule
    end

  rescue Mongoid::Errors::DocumentNotFound
    logger.info "User: #{id} appears to have been deleted"
  end

  private
  def notify_or_reschedule
    if !user.class.devise_modules.include?(:confirmable) || user.confirmed?
      user.send_reset_password_instructions
      user.password_is_placeholder = false
      user.save!
    else
      self.class.perform_in(60.minutes, user.id.to_s)
    end
  end
end
