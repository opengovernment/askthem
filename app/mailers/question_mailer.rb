class QuestionMailer < ActionMailer::Base
  add_template_helper(ApplicationHelper)

  default from: ENV["NOTIFICATION_SENDER_EMAIL"]

  def question_posted(user, question)
    return if user.email_is_disabled?

    @user = user
    @question = question

    @subject = "Your Question on AskThem Has Been Posted"
    if question.needs_confirmation?
      @subject = "Your Question on AskThem Needs Confirmation to be Posted"
    end

    mail to: user.email, subject: @subject
  end

  def signed_on(user, question, new_registration = false)
    return if user.email_is_disabled?

    @user = user
    @question = question
    @new_registration = new_registration
    mail to: user.email, subject: "You're Signed On to '#{@question.title}'"
  end

  def answered_for_author(user, question)
    return if user.email_is_disabled?

    @user = user
    @question = question
    mail to: user.email, subject: "Your AskThem.io question '#{@question.title}' has been answered"
  end

  def answered_for_signer(user, question)
    return if user.email_is_disabled?

    @user = user
    @question = question
    mail to: user.email, subject: "AskThem.io question '#{@question.title}' has been answered"
  end

  def email_person(question)
    # @warn TEMP: disable automatic delivery of question for time being
    # rely on staff members manually doing it for now
    return # replace with line below to reenable
    # return unless question.person.email.present?

    @question = question
    mail to: question.person.email, subject: "People on AskThem want to know"
  end

  def notify_staff_question_at_threshold(question)
    @question = question
    subject = "A question for '#{question.person.name}' has reached its goal"
    mail to: UserRole.staff_members.pluck(:email), subject: subject
  end

  def notify_staff_members_answered(question)
    @question = question
    subject = "'#{question.person.name}' has answered a question"
    mail to: UserRole.staff_members.pluck(:email), subject: subject
  end
end
