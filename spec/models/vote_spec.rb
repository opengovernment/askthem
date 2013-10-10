require "spec_helper"

describe Vote do
  context "when looking at voting records" do
    let(:vote) { Vote.new(yes_votes: [], no_votes: [], other_votes: []) }

    describe "#people" do
      it "returns empty array when no matching people" do
        expect(vote.people).to eq []
      end

      it "returns matching people that have voted" do
        person = FactoryGirl.create(:person)
        yes_votes = [{ "leg_id" => person.id, "name" => person.full_name }]
        vote.write_attribute(:yes_votes, yes_votes)
        expect(vote.people).to eq [person]
      end
    end

    describe "#value_voted_by" do
      let(:person) { FactoryGirl.create(:person) }

      it "returns nil when person hasn't voted" do
        expect(vote.value_voted_by(person)).to be_nil
      end

      it "returns type of vote when person has voted" do
        yes_votes = [{ "leg_id" => person.id, "name" => person.full_name }]
        vote.write_attribute(:yes_votes, yes_votes)
        expect(vote.value_voted_by(person)).to eq "yes"
      end
    end
  end

  describe "#passed?" do
    it "returns true when passed value is true" do
      vote = Vote.new(passed: true)
      expect(vote.passed?).to be_true
    end

    it "returns false when passed value is false" do
      vote = Vote.new(passed: false)
      expect(vote.passed?).to be_false
    end
  end


end
