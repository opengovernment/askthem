require "spec_helper"

describe PagesHelper do
  describe "#csv_safe_links_for" do
    it "returns person's links" do
      person = FactoryGirl.create(:person)
      person_detail = person.person_detail
      person_detail.save
      person_detail.links.create(note: "xxx", url: "http://xxx")

      expect(helper.csv_safe_links_for(person)).to eq "xxx: http://xxx"
    end
  end

  describe "#csv_safe_office_details_for" do
    it "shows office details in a csv safe format" do
      offices = [{"fax"=>"907-465-3517", "name"=>"Session Office", "phone"=>"907-465-4925", "address"=>"State Capitol Room 429\nJuneau AK, 99801", "type"=>"capitol", "email"=>nil}, {"fax"=>"907-486-5264", "name"=>"Interim Office", "phone"=>"907-486-4925", "address"=>"305 Center Ave. Suite 1\nKodiak AK, 99615", "type"=>"district", "email"=>nil}]
      csv_safe_offices = offices.to_s.gsub('"', "").gsub("=>", ":")
        .gsub("[", "").gsub("]", "").gsub("},", " - ").gsub("{", "")
        .gsub(",", "").gsub("\\n", " ").gsub("nil", "").gsub("}", "")
      person = FactoryGirl.create(:person)
      person.write_attribute(:offices, offices)
      person.save

      expect(helper.csv_safe_office_details_for(person)).to eq csv_safe_offices
    end
  end
end
