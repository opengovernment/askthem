require 'spec_helper'
require File.expand_path("../features_helper.rb", __FILE__)

describe "people" do
  describe '#index' do
    context "when at least one person has a staff inspected user account" do
      let(:identity) { FactoryGirl.create(:identity, status: 'verified') }
      let(:person) { identity.person }

      it "is listed as verified" do
        set_up_person_and_metadatum(person)
        visit "/ny/people/"
        page.should have_selector ".is-verified"
      end
    end

    context "when no people have staff inspected user accounts" do
      let(:person) { FactoryGirl.create(:person) }

      it "doesn't list as verified" do
        set_up_person_and_metadatum(person)
        visit "/#{person.metadatum.abbreviation}/people/"
        page.should_not have_selector ".is-verified"
      end
    end
  end

  describe '#show' do
    context "when has a staff inspected user account" do
      let(:identity) { FactoryGirl.create(:identity, status: 'verified') }
      let(:person) { identity.person }

      it "is listed as verified" do
        stub_metadatum_chambers(person)
        visit "/ny/people/#{person.id}"
        page.should have_content "Verified"
      end
    end

    context "when does not staff inspected user account" do
      let(:person) { FactoryGirl.create(:person) }

      it "doesn't list as verified" do
        stub_metadatum_chambers(person)
        visit "/#{person.metadatum.abbreviation}/people/#{person.id}"
        page.should_not have_content "Verified"
      end
    end
  end

  def set_up_person_and_metadatum(person)
    person.write_attribute :active, true
    person.save
    stub_metadatum_chambers(person)
  end

  def stub_metadatum_chambers(person)
    person.metadatum.write_attribute(:chambers, { "lower" =>
                                       { "name"=>"House",
                                         "title"=>"Representative" } })
    person.metadatum.save
  end
end
