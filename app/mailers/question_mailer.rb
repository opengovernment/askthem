class QuestionMailer < ActionMailer::Base
  add_template_helper(ApplicationHelper)

  default from: "support@askthem.io"
  def question_posted(user, question)
    @user = user
    @question = question
    mail to: user.email, subject: "Your Question on AskThem Has Been Posted"
  end

  def signed_on(user, question)
    @user = user
    @question = question
    mail to: user.email, subject: "You're Signed On to '#{@question.title}'"
  end

  def email_person(question)
    return unless question.person.email.present?

    @question = question
    mail to: question.person.email, subject: "People on AskThem want to know"
  end

  def notify_staff_question_at_threshold(question)
    @question = question
    subject = "A question for '#{question.person.name}' has reached its goal"

    UserRole.staff_members.each do |staff_member|
      mail to: staff_member.email, subject: subject
    end
  end
end
