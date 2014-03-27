require "spec_helper"

describe JurisdictionId do
  describe "#id" do
    context "when only state given" do
      let(:options) { { state: "VT" } }

      it "returns state code result" do
        expect(JurisdictionId.new(options).id).to eq "vt"
      end
    end

    context "when state and municipality given" do
      let(:options) { { state: "VT", municipality: "Berlin" } }

      it "returns state code and municipal name result" do
        expect(JurisdictionId.new(options).id).to eq "vt-berlin"
      end
    end

    context "when state and county given" do
      let(:options) { { state: "VT", county: "Washington" } }

      it "returns state code and county name result with prefix" do
        expect(JurisdictionId.new(options).id).to eq "vt-county-washington"
      end
    end
  end
end
