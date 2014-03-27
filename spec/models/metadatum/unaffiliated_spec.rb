require "spec_helper"

describe Metadatum::Unaffiliated do
  describe ".find_or_create!" do
    context "when an unaffilated jurisdiction already exists" do
      before :each do
        @metadatum = Metadatum.create(abbreviation: "unaffiliated")
      end

      it "returns existing unaffiliated jurisdiction" do
        expect(Metadatum::Unaffiliated.find_or_create!).to eq @metadatum
      end
    end

    context "when no unaffilated jurisdiction exists" do
      it "creates a Metadatum with unaffilated jurisdiction attributes" do
        metadatum = Metadatum::Unaffiliated.find_or_create!
        expect(metadatum.attributes).to eq attributes
      end

      def attributes
        { abbreviation: "unaffiliated",
          "_id" => "unaffiliated",
          chambers: { "lower" => { "name" => "Unspecified", "title" => "" } },
          name: "Unaffiliated",
          legislature_name: "",
          default_city_for_state: false
        }.with_indifferent_access
      end
    end
  end
end
