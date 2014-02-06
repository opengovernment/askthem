require "spec_helper"

describe DefaultSignatureThreshold do
  describe "#value" do
    context "person_id is present" do
      let(:person) { Person.create(state: "zz") }

      it "returns default based on person" do
        expect(DefaultSignatureThreshold.new(person).value)
          .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:state]
      end

      context "when person is Councilmember" do
        let(:person) { Councilmember.create(state: "zz") }

        it "returns councilmember default" do
          expect(DefaultSignatureThreshold.new(person).value)
            .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:major_city_council]
        end
      end

      context "when person is FederalLegislator" do
        let(:person) { FederalLegislator.create(state: "zz") }

        context "and is congressperson" do
          it "returns congressperson default" do
            person.write_attribute(:chamber, "lower")

            expect(DefaultSignatureThreshold.new(person).value)
              .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:federal][:lower]
          end
        end

        context "and is senator" do
          it "returns senator default" do
            person.write_attribute(:chamber, "upper")

            expect(DefaultSignatureThreshold.new(person).value)
              .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:federal][:upper]
          end
        end
      end

      context "when person is Governor" do
        let(:person) { Governor.create(state: "zz") }

        it "returns governor default" do
          expect(DefaultSignatureThreshold.new(person).value)
            .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:governor]
        end
      end
    end

    context "when person is unaffiliated" do
      let(:person) { Person.create(state: Metadatum::Unaffiliated::ABBREVIATION) }

      it "returns unaffiliated default" do
        expect(DefaultSignatureThreshold.new(person).value)
          .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:unaffiliated]
      end
    end

    context "person_id is not present" do
      it "returns hardcoded default" do
        expect(DefaultSignatureThreshold.new(nil).value)
          .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:unspecified_person]
      end
    end
  end
end
