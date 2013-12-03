require "spec_helper"

describe FederalOfficial do
  describe ".for_location" do
    before do
      @federal_official = FederalOfficial.create!(state: "us")
    end

    it "returns matching people given a location", :vcr do
      address = "148 Lafayette St, New York, NY"
      expect(FederalOfficial.for_location(address).first)
        .to eq @federal_official
    end
  end
end
