class QuestionMailer < ActionMailer::Base
  add_template_helper(ApplicationHelper)
  
  default from: "develop@opengovernment.org"
  def question_posted(user, question)
    @user = user
    @question = question
    mail(:to => user.email,
        :subject => "Your Question on AskThem Has Been Posted")
  end
end
