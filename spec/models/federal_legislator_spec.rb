require "spec_helper"

describe FederalLegislator do
  describe "#image?" do
    it "returns false if not persisted or id is not set" do
      federal_legislator = FederalLegislator.new
      expect(federal_legislator.image?).to be_false
    end

    it "returns true if persisted and an id is set" do
      federal_legislator = FederalLegislator.create!(first_name: "Ralf",
                                                     last_name: "The Mouth")
      expect(federal_legislator.image?).to be_true
    end
  end

  describe "#image" do
    let(:federal_legislator) { FederalLegislator.new }

    context "when there isn't a custom photo_url attribute" do
      it "returns standard URL for where to find base image" do
        federal_legislator.id = "K000385"
        image_url = "#{FederalLegislator::PHOTOS_BASE_URL}#{federal_legislator.id}.jpg"

        expect(federal_legislator.image).to eq image_url
      end
    end

    context "when there is a custom photo_url attribute" do
      it "returns the photo_url attribute value" do
        photo_url = "http://example.com/test.jpg"
        federal_legislator.photo_url = photo_url

        expect(federal_legislator.image).to eq photo_url
      end
    end
  end

  describe "#political_position_title" do
    it "returns Senator for upper chamber" do
      federal_legislator = FederalLegislator.new
      federal_legislator.write_attribute(:chamber, "upper")
      expect(federal_legislator.political_position_title).to eq "Senator"
    end

    it "returns Representative for lower chamber" do
      federal_legislator = FederalLegislator.new
      federal_legislator.write_attribute(:chamber, "lower")
      expect(federal_legislator.political_position_title).to eq "Representative"
    end
  end

  describe ".for_location" do
    before :each do
      # convoluted setting of id necessary, otherwise id gets generated
      @federal_legislator = FederalLegislator.new(state: "vt")
      @federal_legislator.id = "S000033"
      @federal_legislator.save!
    end

    it "returns matching people given a location", :vcr do
      address = "2227 Paine Turnpike South, Berlin, VT"
      expect(FederalLegislator.for_location(address).first).to eq @federal_legislator
    end
  end

  describe ".load_from_api_for_jurisdiction" do
    it "loads people into database given a state abbreviation", :vcr do
      FederalLegislator.load_from_apis_for_jurisdiction("vt")
      expect(FederalLegislator.count).to eq 3
    end
  end
end
