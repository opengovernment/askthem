require 'spec_helper'

describe QuestionObserver do
  before :each do
    Metadatum.with(session: 'openstates').create(abbreviation: 'zz')
  end

  let :bill do
    Bill.with(session: 'openstates').create(state: 'zz', question_count: 5)
  end

  let :person do
    Person.with(session: 'openstates').create(state: 'zz', question_count: 5)
  end

  let :question do
    FactoryGirl.create(:question, state: 'zz', person: person, bill: bill)
  end

  let :answered_question do
    FactoryGirl.create(:question, state: 'zz', person: person, bill: bill, answered: true)
  end

  context '#after_create' do
    it "should increment the person's question count" do
      expect{FactoryGirl.create(:question, state: 'zz', person: person)}.to change{person.question_count}.by(1)
    end

    it "should increment the bill's question count" do
      expect{FactoryGirl.create(:question, state: 'zz', bill: bill)}.to change{bill.question_count}.by(1)
    end
  end

  context '#after_update' do
    it "should increment the person's answered question count if the question becomes answered" do
      expect{question.update_attribute(:answered, true)}.to change{person.answered_question_count}.by(1)
    end

    it "should increment the bill's answered question count if the question becomes answered" do
      expect{question.update_attribute(:answered, true)}.to change{bill.answered_question_count}.by(1)
    end

    it "should not increment the person's answered question count if the question is already answered" do
      expect{answered_question.update_attribute(:title, 'Hello World')}.to_not change{person.answered_question_count}.by(1)
    end

    it "should not increment the bill's answered question count if the question is already answered" do
      expect{answered_question.update_attribute(:title, 'Hello World')}.to_not change{bill.answered_question_count}.by(1)
    end

    it "should decrement the person's answered question count if the question becomes unanswered" do
      expect{answered_question.update_attribute(:answered, false)}.to change{person.answered_question_count}.by(-1)
    end

    it "should decrement the bill's answered question count if the question becomes unanswered" do
      expect{answered_question.update_attribute(:answered, false)}.to change{bill.answered_question_count}.by(-1)
    end
  end

  context '#after_destroy' do
    it "should decrement the person's question count" do
      expect{question.destroy}.to change{person.question_count}.by(-1)
    end

    it "should decrement the bill's question count" do
      expect{question.destroy}.to change{bill.question_count}.by(-1)
    end

    it "should decrement the person's answered question count if the question was answered" do
      expect{answered_question.destroy}.to change{person.answered_question_count}.by(-1)
    end

    it "should decrement the bill's answered question count if the question was answered" do
      expect{answered_question.destroy}.to change{bill.answered_question_count}.by(-1)
    end

    it "should not decrement the person's answered question count if the question was not answered" do
      expect{question.destroy}.to_not change{person.answered_question_count}.by(-1)
    end

    it "should not decrement the bill's answered question count if the question was not answered" do
      expect{question.destroy}.to_not change{bill.answered_question_count}.by(-1)
    end
  end
end
