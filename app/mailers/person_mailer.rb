class PersonMailer < ActionMailer::Base
  add_template_helper(ApplicationHelper)

  default from: ENV["NOTIFICATION_SENDER_EMAIL"]

  def notify_staff_new_from_twitter(person)
    @person = person
    @screen_name = person.read_attribute(:twitter_id)
    subject = "New person added from Twitter: #{@screen_name}"

    UserRole.staff_members.each do |staff_member|
      mail to: staff_member.email, subject: subject
    end
  end
end
