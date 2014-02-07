class PersonMailer < ActionMailer::Base
  add_template_helper(ApplicationHelper)

  default from: ENV["NOTIFICATION_SENDER_EMAIL"]

  def notify_staff_new_from_twitter(person)
    @person = person
    @screen_name = person.read_attribute(:twitter_id)
    subject = "New person added from Twitter: #{@screen_name}"

    mail to: UserRole.staff_members.pluck(:email), subject: subject
  end

  def notify_staff_bad_person(cached_official)
    @cached_official = cached_official
    subject = "Cached Official does not match person"

    mail to: UserRole.staff_members.pluck(:email), subject: subject
  end
end
