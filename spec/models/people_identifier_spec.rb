require "spec_helper"

describe PeopleIdentifier do
  describe "#people" do
    context "when an email address is submitted" do
      it "returns person with email address if one exists" do
        person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
        person_identifier = PeopleIdentifier.new({ email: person.email })
        expect(person_identifier.people.first).to eq person
      end

      it "returns no people when no one with email is in db" do
        person_identifier = PeopleIdentifier.new({ email: "nothing@no.where" })
        expect(person_identifier.people.count).to eq 0
      end
    end

    context "when an name_fragrment is submitted for a state" do
      it "returns person that matches if one exists" do
        person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
        person.write_attribute(:active, true)
        person.save!

        person_identifier = PeopleIdentifier.new({ name_fragment: "Sheldon",
                                                   jurisdiction: person.state })
        expect(person_identifier.people.first).to eq person
      end

      it "returns no people when no one if there are no matches in db" do
        person_identifier = PeopleIdentifier.new({ name_fragment: "Cthulhu",
                                                   jurisdiction: "ri" })
        expect(person_identifier.people.count).to eq 0
      end
    end

    context "when an twitter_id is submitted" do
      it "returns person that matches if one exists" do
        screen_name = "xyz"
        person = FactoryGirl.create(:person)
        person.write_attribute(:twitter_id, screen_name)
        person.save!

        person_identifier = PeopleIdentifier.new({ twitter_id: screen_name })
        expect(person_identifier.people.first).to eq person
      end

      it "returns no people when no one no matches in db or twitter", vcr: true do
        person_identifier = PeopleIdentifier.new({ twitter_id: "nonexistenttwitter" })
        expect(person_identifier.people.count).to eq 0
      end
    end
  end
end
