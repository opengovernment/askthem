require "spec_helper"

describe CachedOfficial do
  context "when saving or creating an instance" do
    context "if office and division are defined" do
      before do
      @cached_official = CachedOfficial.create(name: "Bernard Sanders",
                                               office: office,
                                               division: division,
                                               state: "vt")
      end

      it "sets their data in top levels attributes" do
        expect(@cached_official.office_name).to eq office[:name]
        expect(@cached_official.division_name).to eq division[:name]
      end

      it "does not allow duplicate entries for same official" do
        duplicate = CachedOfficial.new(name: "Bernard Sanders",
                                       office: office,
                                       division: division)

        expect { duplicate.save! }.to raise_error(Mongoid::Errors::Validations)
      end

      def division
        { name: "Vermont", scope: "statewide",
          ocd_division_id: "ocd-division/country:us/state:vt" }
          .with_indifferent_access
      end

      def office
        { name: "United States Senate", level: "federal" }
          .with_indifferent_access
      end
    end
  end

  describe "#photo_url" do
    it "uses photoUrl if cached official is not yet matched to person" do
      cached_official = CachedOfficial.new(name: "Bernard Sanders",
                                           photoUrl: "x")
      expect(cached_official.photo_url).to eq "x"
    end

    it "uses person's image if available" do
      person = Person.new(photo_url: "y")
      cached_official = CachedOfficial.new(name: "Bernard Sanders",
                                           person: person)

      expect(cached_official.photo_url).to eq "y"
    end
  end

  describe "#twitter_ids" do
    it "grabs twitter_ids from nested channel values" do
      cached_official = CachedOfficial.new(name: "Bernard Sanders",
                                           channels: [{ "id" => "sensanders",
                                                        "type" => "Twitter" }])

      expect(cached_official.twitter_ids).to eq ["sensanders"]
    end
  end
end
