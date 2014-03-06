require "spec_helper"

describe Person do
  before :each do
    @metadatum = Metadatum.create(abbreviation: "vt")
    # convoluted setting of id necessary, otherwise id gets generated
    @person = Person.new(state: "vt")
    @person.id = "VTL000008"
    @person.save!
  end

  describe ".some_name_matches" do
    it "returns people that at least partially match name_fragment" do
      @person.full_name = "Ann E Cummings"
      @person.save
      expect(Person.some_name_matches("Ann").count).to eq 1
    end
  end

  describe ".load_from_api_for_jurisdiction" do
    it "does not overwrite existing people" do
      Person.load_from_apis_for_jurisdiction("vt")
      expect(Person.connected_to("vt").count).to eq 1
    end

    # @todo fix collection clearing!!!
    it "loads people into database given a jurisdiction abbreviation", :vcr do
      # HACK, a simple destroys was not working
      Mongoid::Sessions.with_name("default").collections.each do |collection|
        collection.drop
      end
      @metadatum = Metadatum.create(abbreviation: "vt")
      # END HACK

      Person.load_from_apis_for_jurisdiction("vt")
      expect(Person.connected_to("vt").count).to eq 180
    end
  end

  describe "#most_recent" do
    it "returns nothing when there is no matching value" do
      expect(@person.most_recent(:chamber)).to be_nil
    end

    it "when attribute is present, return that" do
      @person.write_attribute(:chamber, "upper")
      expect(@person.most_recent(:chamber)).to eq "upper"
    end

    it "when only old_roles are present, returns most recent" do
      @person.write_attribute(:old_roles, old_roles)
      expect(@person.most_recent(:chamber)).to eq "lower"
    end

    def old_roles
      { "2007-2008" =>
        [{ "term" => "2007-2008",
           "end_date" => nil,
           "district" => "Chittenden-3-1",
           "level" => "state",
           "country" => "us",
           "chamber" => "upper",
           "state" => "vt",
           "party" => "Progressive",
           "type" => "member",
           "start_date" => nil }],
        "2009-2010" =>
        [{ "term" => "2009-2010",
           "end_date" => nil,
           "district" => "Washington-5",
           "level" => "state",
           "country" => "us",
           "chamber" => "lower",
           "state" => "vt",
           "party" => "Progressive",
           "type" => "member",
           "start_date" => nil }]
      }
    end
  end

  describe "#political_position" do
    it "returns nil when there is no matching attribute" do
      expect(@person.political_position).to be_nil
    end

    it "returns attribute when present" do
      @person.write_attribute(:political_position, "upper")
      expect(@person.political_position).to eq "upper"
    end
  end

  describe "#political_position_title" do
    it "returns nil when there is no value" do
      expect(@person.political_position_title).to be_nil
    end

    it "returns humanized attribute when present" do
      @person.write_attribute(:political_position, "adviser")
      expect(@person.political_position_title).to eq "Adviser"
    end
  end

  describe "#votesmart_id" do
    it "returns nil when not set or set to nil" do
      expect(@person.votesmart_id).to be_nil
    end

    it "returns votesmart_id when set" do
      votesmart_id = "1234"
      @person.write_attribute :votesmart_id, votesmart_id
      expect(@person.votesmart_id).to eq votesmart_id
    end
  end

  describe "#verified?" do
    it "returns false if there is corresponding verified user identity" do
      expect(@person.verified?).to be_false
    end

    it "returns true if there is corresponding verified user identity" do
      identity = FactoryGirl.create(:identity, status: "verified")
      expect(identity.person.verified?).to be_true
    end
  end

  describe "#committees" do
    it "returns empty scope if the user doesn't belong to any committees" do
      expect(@person.committees.count).to eq 0
    end

    it "returns committees that the person belongs to" do
      committee = FactoryGirl.create(:committee)
      @person.write_attribute(:roles, [{ "committee_id" => committee.id }])
      expect(@person.committees.count).to eq 1
      expect(@person.committees.first).to eq committee
    end
  end
end
