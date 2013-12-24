require 'spec_helper'

describe Question do
  %w(state person_id user_id title).each do |attribute|
    it {should validate_presence_of attribute}
  end

  it {should validate_length_of(:title).within(3..70)}

  it 'should validate if the state is in the list of states' do
    metadatum = FactoryGirl.create(:metadatum)
    # should not raise Mongoid::Errors::Validations
    expect{FactoryGirl.create(:question, state: metadatum.abbreviation)}.to_not raise_error
  end
  it 'should not validate if the state is not in the list of states' do
    expect{FactoryGirl.create(:question, state: 'foo')}.to raise_error(Mongoid::Errors::DocumentNotFound)
  end

  it 'should validate if the subject is in the list of subjects' do
    valid_subject = Subject.all.first
    # should not raise Mongoid::Errors::Validations
    expect{ FactoryGirl.create(:question, subject: valid_subject) }.to_not raise_error
  end
  it 'should not validate if the subject is not in the list of subjects' do
    expect{FactoryGirl.create(:question, subject: 'invalid')}.to raise_error(Mongoid::Errors::Validations, /is not included in the list of subjects/)
  end
  it 'should validate if the subject is blank' do
    # should not raise Mongoid::Errors::Validations
    expect{FactoryGirl.create(:question, subject: nil)}.to_not raise_error
  end

  it 'should validate if the bill is blank' do
    # should not raise Mongoid::Errors::Validations
    expect{FactoryGirl.create(:question, bill: nil)}.to_not raise_error
  end

  it 'should validate if the question and the person are in the same jurisdiction' do
    person = FactoryGirl.create(:person)
    # should not raise Mongoid::Errors::Validations
    expect{FactoryGirl.create(:question, person: person, state: 'anytown')}.to_not raise_error
  end

  it 'should not validate if the question and the person are not in the same jurisdiction' do
    metadatum = FactoryGirl.create(:metadatum, abbreviation: 'another')
    person = FactoryGirl.create(:person)
    expect{FactoryGirl.create(:question, person: person, state: 'another')}.to raise_error(Mongoid::Errors::Validations, /The question and the person must belong to the same state/)
  end

  it 'should validate if the bill is blank' do
    # should not raise Mongoid::Errors::Validations
    expect{FactoryGirl.create(:question, bill: nil)}.to_not raise_error
  end

  it 'should validate if the person and the bill are in the same jurisdiction' do
    person = FactoryGirl.create(:person)
    bill = FactoryGirl.create(:bill)
    # should not raise Mongoid::Errors::Validations
    expect{FactoryGirl.create(:question, person: person, bill: bill)}.to_not raise_error
  end

  it 'should not validate if the person and the bill are not in the same jurisdiction' do
    metadatum = FactoryGirl.create(:metadatum, abbreviation: 'another')
    person = FactoryGirl.create(:person)
    bill = FactoryGirl.create(:bill, metadatum: metadatum)
    expect{FactoryGirl.create(:question, person: person, bill: bill)}.to raise_error(Mongoid::Errors::Validations, /The person and the bill must belong to the same state/)
  end

  context 'when in relation' do
    before :each do
      @metadatum = Metadatum.create(abbreviation: 'zz')
      @person = Person.create(state: 'zz')
      @bill = Bill.create(state: 'zz', subjects: ['Health'])
      @question = FactoryGirl.create(:question, person: @person)
      @question_about_bill = FactoryGirl.create(:question, person: @person, bill: @bill)
    end

    it 'should retrieve a metadatum for a question' do
      Question.last.metadatum.should == @metadatum
    end

    it 'should retrieve a question for a person' do
      Person.last.questions.should == [@question, @question_about_bill]
    end

    it 'should retrieve a person for a question' do
      Question.last.person.should == @person
    end

    it 'should retrieve a question for a bill' do
      Bill.last.questions.should == [@question_about_bill]
    end

    it 'should retrieve a bill for a question' do
      Question.last.bill.should == @bill
    end

    it 'should validate if the subject is in the list of subjects' do
      # should not raise Mongoid::Errors::Validations
      expect{FactoryGirl.create(:question, person: @person, subject: 'Health')}.to_not raise_error
    end

    it 'should answer a question' do
      Answer.create(text: 'This is the answer to the question', question: @question)
      expect(@question.answered?).to be_true
    end

  end

  context "with after_create callback" do
    it "copies coordinates from asking user" do
      user = FactoryGirl.create(:user)
      question = FactoryGirl.create(:question, user: user)
      expect(question.reload.coordinates).to eq [-73.9998334, 40.7195898]
    end
  end
end
