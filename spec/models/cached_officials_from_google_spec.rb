require "spec_helper"

describe CachedOfficialsFromGoogle do
  let(:address) { "148 Lafayette St, New York, NY 10013"}
  let(:cached_officials) { CachedOfficialsFromGoogle.new(address) }

  describe "#each", :vcr do
    it "iterates over the collection of cached officials" do
      cached_official_names = cached_officials.map(&:name)

      expect(cached_official_names).to eq official_names
    end

    def official_names
      ["Daniel L Squadron", "Andrew Cuomo", "Charles E. Schumer", "Kirsten E. Gillibrand", "Margaret Chin", "Michael R. Bloomberg", "Jerrold Nadler"]
    end
  end

  describe "if a matching cached_official exists" do
    it "returns existing official rather than creating a new one", :vcr do
      expect(CachedOfficialsFromGoogle.new(address).first.id)
        .to eq cached_officials.first.id
    end
  end
end
