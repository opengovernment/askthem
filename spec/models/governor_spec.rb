require "spec_helper"

describe Governor do
  describe ".load_governors" do
    it "populates governor data for all states", :vcr do
      Governor.load_governors
      expect(Governor.count).to eq 50
    end
  end
end
