require "spec_helper"

describe StateOfficial do
  describe ".for_location" do
    before do
      @state_official = StateOfficial.create!(state: "vt")
    end

    it "returns matching people given a location", :vcr do
      address = "2227 Paine Turnpike, Berlin, VT"
      expect(StateOfficial.for_location(address).first)
        .to eq @state_official
    end
  end
end
