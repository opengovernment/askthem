require 'spec_helper'

describe Question do
  %w(state user_id person_id title body).each do |attribute|
    it {should validate_presence_of attribute}
  end

  it {should validate_length_of(:title).within(3..60)}
  it {should validate_length_of(:body).with_minimum(60)}

  it 'should validate if the state is in the list of states' do
    pending
  end
  it 'should not validate if the state is not in the list of states' do
    pending
  end
  it 'should validate if the subject is in the list of subjects' do
    pending
  end
  it 'should not validate if the subject is not in the list of subjects' do
    pending
  end
  it 'should validate if the subject is blank' do
    pending
  end

  context 'with two sessions' do
    before :each do
      Metadatum.with(session: 'openstates').create(abbreviation: 'zz')
    end

    let :person do
      Person.with(session: 'openstates').create(state: 'zz')
    end

    let :bill do
      Bill.with(session: 'openstates').create(state: 'zz')
    end

    it 'should create a question in the default session for a state in the OpenStates session' do
      expect{FactoryGirl.create(:question, state: 'zz')}.to change{Question.with(session: 'default').count}.by(1)
    end

    it 'should create a question in the default session with a subject from the OpenStates session' do
      Bill.with(session: 'openstates').create(state: 'zz', subjects: 'Health')
      expect{FactoryGirl.create(:question, state: 'zz', subject: 'Health')}.to change{Question.with(session: 'default').count}.by(1)
    end

    it "should retrieve a person's questions from the default session for a person in the OpenStates session" do
      question = FactoryGirl.create(:question, state: 'zz', person: person)
      person.questions.should == [question]
    end

    it "should retrieve a bill's questions from the default session for a bill in the OpenStates session" do
      question = FactoryGirl.create(:question, state: 'zz', person: person, bill: bill)
      person.questions.should == [question]
    end
  end
end
