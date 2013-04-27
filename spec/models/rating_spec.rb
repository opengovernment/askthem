require 'spec_helper'

describe Rating do
  %w(state person_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  context 'with two sessions' do
    before :each do
      @metadatum = Metadatum.with(session: 'openstates').create(abbreviation: 'zz')
      @person = Person.with(session: 'openstates').create(state: 'zz')
      @record = Rating.with(session: 'default').create(person: @person)
    end

    it "should retrieve a metadatum from the OpenStates session for a rating in the default session" do
      Rating.with(session: 'default').last.metadatum.should == @metadatum
    end

    it "should retrieve a rating from the default session for a person in the OpenStates session" do
      Person.with(session: 'openstates').last.ratings.should == [@record]
    end

    it "should retrieve a person from the OpenStates session for a rating in the default session" do
      Rating.with(session: 'default').last.person.should == @person
    end
  end
end
