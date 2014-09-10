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
  end
end
