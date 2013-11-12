# -*- coding: utf-8 -*-
require "spec_helper"

describe Metadatum::SeedCities do
  describe ".find_or_create!" do
    context "when seed city jurisdictions already exist" do
      before :each do
        @metadata = [Metadatum.create(abbreviation: "ca-san-jose"),
                     Metadatum.create(abbreviation: "il-chicago"),
                     Metadatum.create(abbreviation: "pa-philadelphia")]
      end

      it "returns existing seed city jurisdictions" do
        expect(Metadatum::SeedCities.find_or_create!).to eq @metadata
      end
    end

    context "when no seed city jurisdictions exist" do
      it "creates a Metadatum with seed cities' attributes" do
        metadata = Metadatum::SeedCities.find_or_create!
        expect(metadata.last.attributes).to eq attributes
      end

      def attributes
        {"_id"=>"pa-philadelphia", "_ignored_scraped_sessions"=>["2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997"], "abbreviation"=>"pa-philadelphia", "capitol_timezone"=>"America/New_York", "chambers"=>{"upper"=>{"name"=>"Council", "title"=>"Councilmember"}}, "feature_flags"=>[], "latest_update" => Time.zone.parse("2013-02-26 03:00:04 UTC"), "legislature_name"=>"Philadelphia City Council", "name"=>"Philadelphia", "session_details"=>{"2013"=>{"_scraped_name"=>"2013", "display_name"=>"2013 Legislative Session", "type"=>"primary"}, "2012"=>{"_scraped_name"=>"2012", "display_name"=>"2012 Legislative Session", "type"=>"primary"}}, "terms"=>[{"end_year"=>2016, "start_year"=>2012, "name"=>"2012-2016", "sessions"=>["2013", "2012"]}]}.with_indifferent_access
      end
    end
  end
end
