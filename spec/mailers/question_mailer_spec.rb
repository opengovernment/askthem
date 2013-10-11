require "spec_helper"

describe QuestionMailer do

  it "sends question posted e-mail" do
    user = FactoryGirl.create(:user)
    question = FactoryGirl.create(:question)
    QuestionMailer.question_posted(user, question).deliver
    last_email = ActionMailer::Base.deliveries.last

    last_email.to.should == [user.email]
    last_email.from.should eq(["support@askthem.io"])
    last_email.subject.should eq("Your Question on AskThem Has Been Posted")
    last_email.body.encoded.should match( question_url(question.state, question.id) )
  end

  it "sends signed on to question e-mail" do
    user = FactoryGirl.create(:user)
    question = FactoryGirl.create(:question)
    QuestionMailer.signed_on(user, question).deliver
    last_email = ActionMailer::Base.deliveries.last
    last_email.to.should == [user.email]
    last_email.from.should == ["support@askthem.io"]
    last_email.subject.should == "You're Signed On to '#{question.title}'"
    last_email.body.encoded.should match(question_url(question.state, question.id))
  end
end
