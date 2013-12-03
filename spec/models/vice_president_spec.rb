require "spec_helper"

describe VicePresident do
  describe ".for_location" do
    before do
      @vice_president = VicePresident.create!(state: "us")
    end

    it "returns matching people given a location", :vcr do
      address = "148 Lafayette St, New York, NY"
      expect(VicePresident.for_location(address).first).to eq @vice_president
    end
  end
end
