require 'spec_helper'

describe PersonDetail do
  context 'with two sessions' do
    before :each do
      Metadatum.with(session: 'openstates').create(abbreviation: 'zz')
    end

    it "should retrieve a person's details from the default session for a person in the OpenStates session" do
      person = Person.with(session: 'openstates').create(state: 'zz')
      record = PersonDetail.with(session: 'default').create(person: person)
      Person.with(session: 'openstates').last.person_detail.should == record
    end

    it "should retrieve a person from the OpenStates session for a person detail in the default session" do
      person = Person.with(session: 'openstates').create(state: 'zz')
      record = PersonDetail.with(session: 'default').create(person: person)
      PersonDetail.with(session: 'default').last.person.should == person
    end
  end
end