require "spec_helper"

describe Mayor do
  describe ".for_location" do
    before do
      @mayor = Mayor.create!(state: "ny-new-york")
    end

    it "returns matching people given a location", :vcr do
      address = "148 Lafayette St, New York, NY"
      expect(Mayor.for_location(address).first).to eq @mayor
    end
  end
end
