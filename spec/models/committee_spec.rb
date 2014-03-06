require "spec_helper"

describe Committee do
  let(:committee) { FactoryGirl.create(:committee) }

  describe "#name" do
    context "when subcommittee is present" do
      it "returns subcommittee value" do
        committee.write_attribute(:subcommittee, "sub")
        expect(committee.name).to eq "sub"
      end
    end

    context "when subcommittee is not present" do
      it "returns committee value" do
        committee.write_attribute(:committee, "committee")
        expect(committee.name).to eq "committee"
      end
    end
  end

  describe "#people" do
    context "when there are no people associated with a committee" do
      it "returns no results" do
        committee.write_attribute(:members, [])
        expect(committee.people.count).to eq 0
      end
    end

    context "when there are people on the committee" do
      it "returns people as result" do
        person = FactoryGirl.create(:person)
        committee.write_attribute(:members, [{ "leg_id" => person.id }])
        expect(committee.people.count).to eq 1
      end
    end
  end
end
