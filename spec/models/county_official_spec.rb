require "spec_helper"

describe CountyOfficial do
  describe ".for_location" do
    before do
      @county_official = CountyOfficial.create!(state: "ny-county-new-york")
    end

    it "returns matching people given a location", :vcr do
      address = "148 Lafayette St, New York, NY"
      expect(CountyOfficial.for_location(address).first).to eq @county_official
    end
  end
end
