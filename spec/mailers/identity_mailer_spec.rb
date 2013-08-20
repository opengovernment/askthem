require "spec_helper"

describe IdentityMailer do
  let(:identity) { FactoryGirl.create(:identity) }

  before { ActionMailer::Base.deliveries.clear }

  it ".identity_submitted sends user e-mail" do
    IdentityMailer.identity_submitted(identity).deliver
    last_email = ActionMailer::Base.deliveries.last

    last_email.to.should == [identity.user.email]
    last_email.subject.should eq("Your AskThem identity is being verified")
  end

  it ".identity_verified sends user e-mail" do
    IdentityMailer.identity_verified(identity).deliver
    last_email = ActionMailer::Base.deliveries.last

    last_email.to.should == [identity.user.email]
    last_email.subject.should eq("Your AskThem identity has been verified")
  end

  it ".identity_rejected sends user e-mail" do
    IdentityMailer.identity_rejected(identity).deliver
    last_email = ActionMailer::Base.deliveries.last

    last_email.to.should == [identity.user.email]
    last_email.subject.should eq("Your AskThem identity could not be verified")
  end
end
