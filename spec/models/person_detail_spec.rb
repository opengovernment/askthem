require 'spec_helper'

describe PersonDetail do
  context 'with two sessions' do
    before :each do
      Metadatum.with(session: 'openstates').create(abbreviation: 'zz')
    end

    it "should retrieve a person's details from the default session for a person in the OpenStates session" do
      person = Person.with(session: 'openstates').create(state: 'zz')
      record = PersonDetail.with(session: 'default').create(person: person)
      person.person_detail.should == record
    end
  end
end