require 'spec_helper'

describe Candidate do
  describe "#political_position_title" do
    it "returns as candidate for office" do
      state = FactoryGirl.create(:metadatum, abbreviation: "vt")
      state.write_attribute(:name, "Vermont")
      state.save!

      candidate = Candidate.new(state: state.abbreviation)
      candidate.write_attribute(:running_for_position, "U.S. Representative")

      result = "Candidate for #{state.name} U.S. Representative"

      expect(candidate.political_position_title).to eq result
    end

    context "when there is current_office_holder with a district" do
      it "returns as candidate for office" do
        state = FactoryGirl.create(:metadatum, abbreviation: "vt")
        state.write_attribute(:name, "Vermont")
        state.save!

        candidate = Candidate.new(state: state.abbreviation)
        candidate.write_attribute(:running_for_position, "U.S. Representative")
        representative = FederalLegislator.new
        representative.stub(most_recent_district: 3)
        candidate.stub(current_office_holder: representative)

        result = "Candidate for #{state.name}, District 3,  U.S. Representative"

        expect(candidate.political_position_title).to eq result
      end
    end

    context "when there is an executive, i.e. governor, current_office_holder" do
      it "returns as candidate for office without district" do
        state = FactoryGirl.create(:metadatum, abbreviation: "vt")
        state.write_attribute(:name, "Vermont")
        state.save!

        candidate = Candidate.new(state: state.abbreviation)
        candidate.write_attribute(:running_for_position, "Governor")
        governor = Governor.new
        candidate.stub(current_office_holder: governor)

        result = "Candidate for #{state.name} Governor"

        expect(candidate.political_position_title).to eq result
      end
    end
  end
end
