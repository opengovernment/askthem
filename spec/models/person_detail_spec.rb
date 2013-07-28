require 'spec_helper'

describe PersonDetail do
  %w(state person_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  context 'when in relation' do
    before :each do
      @metadatum = Metadatum.create(abbreviation: 'zz')
      @person = Person.create(state: 'zz')
      @record = PersonDetail.create(person: @person)
    end

    it 'should retrieve a metadatum for a person detail' do
      PersonDetail.last.metadatum.should == @metadatum
    end

    it "should retrieve a person's details for a person" do
      Person.last.person_detail.should == @record
    end

    it 'should retrieve a person for a person detail' do
      PersonDetail.last.person.should == @person
    end
  end
end
