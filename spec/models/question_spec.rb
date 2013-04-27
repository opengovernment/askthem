require 'spec_helper'

describe Question do
  %w(state person_id user_id title body).each do |attribute|
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

  it 'should validate if the bill and the person are in the same state' do
    pending
  end
  it 'should not validate if the bill and the person are not in the same state' do
    pending
  end
  it 'should validate if the bill is blank' do
    pending
  end

  context 'with two sessions' do
    before :each do
      @metadatum = Metadatum.with(session: 'openstates').create(_id: 'zz', abbreviation: 'zz')
      @person = Person.with(session: 'openstates').create(state: 'zz')
      @bill = Bill.with(session: 'openstates').create(state: 'zz', subjects: ['Health'])
      @question = FactoryGirl.create(:question, person: @person)
      @question_about_bill = FactoryGirl.create(:question, person: @person, bill: @bill)
    end

    it "should retrieve a metadatum from the OpenStates session for a question in the default session" do
      Question.with(session: 'default').last.metadatum.should == @metadatum
    end

    it "should retrieve a question from the default session for a person in the OpenStates session" do
      Person.with(session: 'openstates').last.questions.should == [@question, @question_about_bill]
    end

    it "should retrieve a person from the OpenStates session for a question in the default session" do
      Question.with(session: 'default').last.person.should == @person
    end

    it "should retrieve a question from the default session for a bill in the OpenStates session" do
      Bill.with(session: 'openstates').last.questions.should == [@question_about_bill]
    end

    it "should retrieve a bill from the OpenStates session for a question in the default session" do
      Question.with(session: 'default').last.bill.should == @bill
    end

    it 'should validate if the subject is in the list of subjects in the OpenStates session' do
      expect{FactoryGirl.build(:question, state: 'zz', subject: 'Health')}.to_not raise_error
    end
  end
end
