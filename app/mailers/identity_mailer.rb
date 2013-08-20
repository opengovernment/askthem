class IdentityMailer < ActionMailer::Base
  add_template_helper(ApplicationHelper)

  default from: "develop@opengovernment.org"

  def identity_submitted(identity)
    send_user_mail_for(identity, "Your AskThem identity is being verified")
  end

  def identity_verified(identity)
    send_user_mail_for(identity, "Your AskThem identity has been verified")
  end

  def identity_rejected(identity)
    send_user_mail_for(identity, "Your AskThem identity could not be verified")
  end

  private
  def send_user_mail_for(identity, subject)
    @user = identity.user
    @person = identity.person
    mail :to => @user.email, :subject => subject
  end
end
