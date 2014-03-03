require "spec_helper"

describe Metadatum do
  describe ".local_to" do
    it "returns metadatum that matches given locality and region" do
      metadatum = FactoryGirl.create(:metadatum, abbreviation: "ny-new-york")
      expect(Metadatum.local_to("New York", "NY")).to eq metadatum
    end
  end
end
