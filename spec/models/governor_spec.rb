require "spec_helper"

describe Governor do
  describe ".load_governors" do
    it "populates governor data for all states", :vcr do
      Governor.load_governors
      expect(Governor.count).to eq 50
    end
  end

  describe ".for_location" do
    before do
      @governor = Governor.create!(state: "vt")
    end

    it "returns matching people given a location", :vcr do
      address = "2227 Paine Turnpike South, Berlin, VT"
      expect(Governor.for_location(address).first).to eq @governor
    end
  end
end
