require "spec_helper"

describe Councilmember do
  describe ".for_location" do
    before do
      @councilmember = Councilmember.create!(state: "pa-philadelphia")
    end

    it "returns matching people given a location", :vcr do
      address = "Philadelphia, PA"
      expect(Councilmember.for_location(address).first).to eq @councilmember
    end
  end
end
