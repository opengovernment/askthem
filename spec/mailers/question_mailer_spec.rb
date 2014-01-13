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

  it "sends an email to a Person when the signature threshold is met" do
    person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
    question = FactoryGirl.create(:question, person: person)
    question.signature_count = question.person.signature_threshold
    QuestionMailer.email_person(question).deliver

    last_email = ActionMailer::Base.deliveries.last
    last_email.to.should == [question.person.email]
    last_email.from.should eq(["support@askthem.io"])
    last_email.subject.should == "People on AskThem want to know"
    last_email.body.encoded.should match(question_url(question.state, question.id))
  end
end
