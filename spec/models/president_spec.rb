require "spec_helper"

describe President do
  describe ".for_location" do
    before do
      @president = President.create!(state: "us")
    end

    it "returns matching people given a location", :vcr do
      address = "148 Lafayette St, New York, NY"
      expect(President.for_location(address).first).to eq @president
    end
  end
end
