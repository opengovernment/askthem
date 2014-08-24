require 'spec_helper'
require File.expand_path("../features_helper.rb", __FILE__)

# see pages_controller_spec for specs that set session variables
describe "pages#locator" do
  let(:person) { FactoryGirl.create(:federal_legislator_bernard_sanders) }

  before do
    person.write_attribute(:active, true)
    person.save!
  end

  context "when passed only_show parameter with people as value" do
    it "only shows elected officials", vcr: true do
      question = FactoryGirl.create(:question,
                                    title: "xyz",
                                    person: person,
                                    state: "vt")

      visit "/locator?q=05602&only_show=people"

      expect(page).to have_content("Bernard Sanders")
      expect(page).to_not have_content(question.title)
    end

    it "includes a button to ask each person a question", vcr: true do
      visit "/locator?q=05602&only_show=people"
      expect(page.body.include?("/vt/questions/new?person=S000033")).to be_true
    end
  end
end
