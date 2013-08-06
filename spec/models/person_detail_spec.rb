require 'spec_helper'

describe PersonDetail do
  %w(state person_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  describe '#signature_threshold' do
    context 'person is set' do
      before :each do
        @metadatum = Metadatum.create(abbreviation: 'pa-philadelphia')
        @person = Person.create(state: 'pa-philadelphia')
        @person_detail = PersonDetail.create(person: @person)
      end

      it 'returns default based on type of person' do
        expect(@person_detail.signature_threshold).to eq 25
      end
    end

    context 'person is not set' do
      before :each do
        @person_detail = PersonDetail.new
      end

      it 'returns hardcoded default from DefaultSignatureThreshold' do
        expect(@person_detail.signature_threshold).to eq 500
      end
    end
  end

  context 'with two sessions' do
    before :each do
      @metadatum = Metadatum.with(session: 'openstates').create(abbreviation: 'zz')
      @person = Person.with(session: 'openstates').create(state: 'zz')
      @record = PersonDetail.with(session: 'default').create(person: @person)
    end

    it "should retrieve a metadatum from the OpenStates session for a person detail in the default session" do
      PersonDetail.with(session: 'default').last.metadatum.should == @metadatum
    end

    it "should retrieve a person's details from the default session for a person in the OpenStates session" do
      Person.with(session: 'openstates').last.person_detail.should == @record
    end

    it "should retrieve a person from the OpenStates session for a person detail in the default session" do
      PersonDetail.with(session: 'default').last.person.should == @person
    end
  end
end
