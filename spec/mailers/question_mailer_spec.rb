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
    last_email.body.encoded.should match(question_url(question.state,
                                                      question.id))
  end

  it "sends email to person that signature threshold is met" do
    pending "feature being reenabled, see question_mailer#email_person"

    person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
    question = FactoryGirl.create(:question, person: person)
    question.signature_count = question.person.signature_threshold
    QuestionMailer.email_person(question).deliver

    last_email = ActionMailer::Base.deliveries.last
    last_email.to.should == [question.person.email]
    last_email.from.should eq(["support@askthem.io"])
    last_email.subject.should == "People on AskThem want to know"
    last_email.body.encoded.should match(question_url(question.state,
                                                      question.id))
  end

  it "sends email to staff members that question threshold has been met" do
    person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
    question = FactoryGirl.create(:question, person: person)
    question.signature_count = question.person.signature_threshold

    staff_member = FactoryGirl.create(:user)
    staff_member.add_role :staff_member

    QuestionMailer.notify_staff_question_at_threshold(question).deliver

    last_email = ActionMailer::Base.deliveries.last
    expect(last_email.to).to eq [staff_member.email]
    expect(last_email.from).to eq ["support@askthem.io"]
    subject = "A question for '#{person.name}' has reached its goal"
    expect(last_email.subject).to eq subject
    expect(last_email.body.encoded).to match(question_url(question.state,
                                                          question.id))
  end
end
