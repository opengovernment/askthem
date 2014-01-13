class QuestionMailer < ActionMailer::Base
  add_template_helper(ApplicationHelper)

  default from: "support@askthem.io"
  def question_posted(user, question)
    @user = user
    @question = question
    mail(:to => user.email,
        :subject => "Your Question on AskThem Has Been Posted")
  end

  def signed_on(user, question)
    @user = user
    @question = question
    mail(:to => user.email,
        :subject => "You're Signed On to '#{@question.title}'")
  end

  def email_person(question, mail_staff = false)
    @question = question
    @mail_staff = mail_staff

    if mail_staff
      UserRole.staff_members.each do |staff_member|
        mail(to: staff_member.email,
             subject: "Error sending email to '#{question.person.name}'")
      end
    else
      mail(to: question.person.email,
          subject: "People on AskThem want to know")
    end
  end
end
