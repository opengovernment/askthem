require "spec_helper"

describe StateLegislator do
  describe ".for_location" do
    before do
      # convoluted setting of id necessary, otherwise id gets generated
      @state_legislator = StateLegislator.new(state: "vt")
      @state_legislator.id = "VTL000008"
      @state_legislator.save!
    end

    it "returns matching people given a location", :vcr do
      address = "2227 Paine Turnpike South, Berlin, VT"
      expect(StateLegislator.for_location(address).first).to eq @state_legislator
    end
  end
end
