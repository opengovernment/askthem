# -*- coding: utf-8 -*-
require "spec_helper"
require "legislator"

describe Legislator do
  before do
    @legislator = Person.new
    @legislator.extend Legislator
  end

  describe "#most_recent_chamber" do
    it "returns nothing when there is no chamber" do
      expect(@legislator.most_recent_chamber).to be_nil
    end

    it "when attribute is present, return that" do
      @legislator.write_attribute(:chamber, "upper")
      expect(@legislator.most_recent_chamber).to eq "upper"
    end

    it "when only old_roles are present, returns most recent" do
      @legislator.write_attribute(:old_roles, old_roles)
      expect(@legislator.most_recent_chamber).to eq "lower"
    end
  end

  describe "#most_recent_chamber_title" do
    it "returns metadatum title for legislators most_recent_chamber" do
      state = FactoryGirl.create(:metadatum)
      state.write_attribute(:chambers, chambers)
      state.save!

      @legislator.state = state.abbreviation
      @legislator.write_attribute(:chamber, "upper")
      expect(@legislator.most_recent_chamber_title).to eq "Senator"
    end

    def chambers
      { "upper"=> { "name" => "Senate", "title" => "Senator" },
        "lower" => { "name" => "House", "title" => "Representative" } }
    end
  end

  describe "#most_recent_district" do
    it "returns nothing when there is no district" do
      expect(@legislator.most_recent_district).to be_nil
    end

    it "when attribute is present, return that" do
      @legislator.write_attribute(:district, "Chittenden-3-1")
      expect(@legislator.most_recent_district).to eq "Chittenden-3-1"
    end

    it "when only old_roles are present, returns most recent" do
      @legislator.write_attribute(:old_roles, old_roles)
      expect(@legislator.most_recent_district).to eq "Washington-5"
    end
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
