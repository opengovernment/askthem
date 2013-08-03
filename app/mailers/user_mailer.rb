class UserMailer < ActionMailer::Base
  default from: "from@example.com"
  def question_email(user, question)
    @user = user
    mail(:to => user.email,
        :subject => "AskThem Question Posted")
  end
end
