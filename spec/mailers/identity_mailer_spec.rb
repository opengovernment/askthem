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

  it ".identity_needs_inspection sends staff member e-mail" do
    staff_member = FactoryGirl.create(:user)
    staff_member.add_role :staff_member

    IdentityMailer.identity_needs_inspection(identity, staff_member).deliver
    last_email = ActionMailer::Base.deliveries.last

    last_email.to.should == [staff_member.email]
    last_email.subject.should eq("An AskThem identity needs to be inspected")
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
