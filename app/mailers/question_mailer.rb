class QuestionMailer < ActionMailer::Base
  add_template_helper(ApplicationHelper)

  default from: "develop@opengovernment.org"
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

  def email_person(question, mail_admin=false)
    @question = question
    @mail_admin = mail_admin
    if mail_admin
      mail(:to => 'admin@opengovernment.org',
          :subject => "Error sending email to '#{question.person.name}'")
    else
      mail(:to => question.person.email,
          :subject => "People on AskThem want to know")
    end
  end
end
