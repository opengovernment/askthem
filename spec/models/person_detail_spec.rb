require "spec_helper"

describe PersonDetail do
  %w(state person_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  describe "#signature_threshold" do
    context "person is set" do
      before :each do
        @metadatum = Metadatum.create(abbreviation: "pa-philadelphia")
        @person = Councilmember.create(state: "pa-philadelphia")
        @person_detail = PersonDetail.create(person: @person)
      end

      it "returns default based on type of person" do
        expect(@person_detail.signature_threshold).to eq 25
      end
    end

    context "person is not set" do
      before :each do
        @person_detail = PersonDetail.new
      end

      it "returns hardcoded default from DefaultSignatureThreshold" do
        expect(@person_detail.signature_threshold).to eq 500
      end
    end
  end

  context "when in relation" do
    before :each do
      @metadatum = Metadatum.create(abbreviation: "zz")
      @person = Person.create(state: "zz")
      @record = PersonDetail.create(person: @person)
    end

    it "should retrieve a metadatum for a person detail" do
      PersonDetail.last.metadatum.should == @metadatum
    end

    it "should retrieve a person's details for a person" do
      Person.last.person_detail.should == @record
    end

    it "should retrieve a person for a person detail" do
      PersonDetail.last.person.should == @person
    end
  end
end
