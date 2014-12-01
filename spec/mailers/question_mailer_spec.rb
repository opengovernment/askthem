require "spec_helper"

describe QuestionMailer do
  it "sends question posted e-mail" do
    user = FactoryGirl.create(:user)
    question = FactoryGirl.create(:question)
    QuestionMailer.question_posted(user, question).deliver

    last_email = ActionMailer::Base.deliveries.last
    last_email.to.should == [user.email]
    last_email.subject.should eq("Your Question on AskThem Has Been Posted")
    last_email.body.encoded.should match( question_url(question.state, question.id) )
  end

  it "sends signed on to question e-mail" do
    user = FactoryGirl.create(:user)
    question = FactoryGirl.create(:question)
    QuestionMailer.signed_on(user, question).deliver

    last_email = ActionMailer::Base.deliveries.last
    last_email.to.should == [user.email]
    last_email.subject.should == "You're Signed On to '#{question.title}'"
    last_email.body.encoded.should match(question_url(question.state,
                                                      question.id))
  end

  it "sends author question answered e-mail" do
    user = FactoryGirl.create(:user)
    question = FactoryGirl.create(:question)
    QuestionMailer.answered_for_author(user, question).deliver

    last_email = ActionMailer::Base.deliveries.last
    last_email.to.should == [user.email]
    last_email.subject.should == "Your AskThem.io question '#{question.title}' has been answered"
    last_email.body.encoded.should match(question_url(question.state,
                                                      question.id))
  end

  it "sends signer question answered e-mail" do
    user = FactoryGirl.create(:user)
    question = FactoryGirl.create(:question)
    QuestionMailer.answered_for_signer(user, question).deliver

    last_email = ActionMailer::Base.deliveries.last
    last_email.to.should == [user.email]
    last_email.subject.should == "AskThem.io question '#{question.title}' has been answered"
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
    subject = "A question for '#{person.name}' has reached its goal"
    expect(last_email.subject).to eq subject
    expect(last_email.body.encoded).to match(question_url(question.state,
                                                          question.id))
  end

  it "sends email to staff members that question has been answered" do
    person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
    question = FactoryGirl.create(:question, person: person, answered: true)

    staff_member = FactoryGirl.create(:user)
    staff_member.add_role :staff_member

    QuestionMailer.notify_staff_members_answered(question).deliver

    last_email = ActionMailer::Base.deliveries.last
    expect(last_email.to).to eq [staff_member.email]
    subject = "'#{person.name}' has answered a question"
    expect(last_email.subject).to eq subject
    expect(last_email.body.encoded).to match(question_url(question.state,
                                                          question.id))
  end

  context "when email_is_disabled is true" do
    it "does not send question posted e-mail" do
      user = FactoryGirl.create(:user, email_is_disabled: true)
      question = FactoryGirl.create(:question)

      expect { QuestionMailer.question_posted(user, question).deliver }
        .to_not change { ActionMailer::Base.deliveries.count }.from(0).to(1)
    end

    it "does not send signed on to question e-mail" do
      user = FactoryGirl.create(:user, email_is_disabled: true)
      question = FactoryGirl.create(:question)

      expect { QuestionMailer.signed_on(user, question).deliver }
        .to_not change { ActionMailer::Base.deliveries.count }.from(0).to(1)
    end

    it "does not send author question answered e-mail" do
      user = FactoryGirl.create(:user, email_is_disabled: true)
      question = FactoryGirl.create(:question)

      expect { QuestionMailer.answered_for_author(user, question).deliver }
        .to_not change { ActionMailer::Base.deliveries.count }.from(0).to(1)
    end

    it "does not send signer question answered e-mail" do
      user = FactoryGirl.create(:user, email_is_disabled: true)
      question = FactoryGirl.create(:question)

      expect { QuestionMailer.answered_for_signer(user, question).deliver }
        .to_not change { ActionMailer::Base.deliveries.count }.from(0).to(1)
    end
  end
end
