require "spec_helper"

describe MunicipalOfficial do
  describe ".for_location" do
    before do
      @municipal_official = MunicipalOfficial.create!(state: "ny-new-york")
    end

    it "returns matching people given a location", :vcr do
      address = "148 Lafayette St, New York, NY"
      expect(MunicipalOfficial.for_location(address).first)
        .to eq @municipal_official
    end
  end
end
