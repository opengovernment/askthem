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
end
