require "spec_helper"

describe LocationFormatter do
  describe "#format" do
    it "returns nil when location is invalid", :vcr do
      expect(LocationFormatter.new(0).format).to be_nil
    end

    it "returns geocode result for valid address", :vcr do
      formatted_location = LocationFormatter.new("05602").format
      expect(formatted_location.state_code).to eq "VT"
    end
  end
end
