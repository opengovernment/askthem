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
end
