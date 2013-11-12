# -*- coding: utf-8 -*-
# used for populating new instances of Metadatum
# for our seed jurisdictions of Philadelphia and San Jos
class Metadatum::SeedCities
  ABBREVIATIONS = ["ca-san-jose", "pa-philadelphia", "il-chicago"]

  # return seed city jurisdictions
  def self.find_or_create!
    if Metadatum.in(abbreviation: ABBREVIATIONS).count > 0
      Metadatum.find(ABBREVIATIONS)
    else
      create_seed_cities_metadata
    end
  end

  def self.create_seed_cities_metadata
    ABBREVIATIONS.each do |key|
      Metadatum.create! attribute_sets[key]
    end
    Metadatum.find(ABBREVIATIONS)
  end

  # @todo - chicago session_details and terms are fake (copied)
  # replaced w/ accurate data
  def self.attribute_sets
    { "ca-san-jose" => { "_id" => "ca-san-jose", "feature_flags" => [], "terms" => [{ "end_year" => 2012, "start_year" => 2011, "name" => "2011-2012", "sessions" => ["2012"] }, { "end_year" => 2014, "start_year" => 2013, "name" => "2013-2014", "sessions" => ["2013"]}], "name" => "San José", "session_details" => { "2013" => { "_scraped_name" => "2013", "display_name" => "2013 Legislative Session", "type" => "primary" }, "2012" => { "_scraped_name" => "2012", "display_name" => "2012 Legislative Session", "type" => "primary" } }, "abbreviation" => "ca-san-jose", "latest_update" => Time.zone.parse("2013-08-30 20:03:58 UTC"), "_ignored_scraped_sessions" => ["2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "1996", "1995"], "chambers" => { "upper" => { "name" => "Council", "title" => "Councilmember" } }, "capitol_timezone" => "America/Los_Angeles", "legislature_name" => "San José City Council", "legislature_url" => "http://www.sanjoseca.gov/" },
      "pa-philadelphia" => { "_id" => "pa-philadelphia", "_ignored_scraped_sessions" => ["2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997"], "abbreviation" => "pa-philadelphia", "capitol_timezone" => "America/New_York", "chambers" => { "upper" => { "name" => "Council", "title" => "Councilmember" } }, "feature_flags" => [], "latest_update" => Time.zone.parse("2013-02-26 03:00:04 UTC"), "legislature_name" => "Philadelphia City Council", "name" => "Philadelphia", "session_details" => { "2013" => { "_scraped_name" => "2013", "display_name" => "2013 Legislative Session", "type" => "primary" }, "2012" => { "_scraped_name" => "2012", "display_name" => "2012 Legislative Session", "type" => "primary" } }, "terms" => [{ "end_year" => 2016, "start_year" => 2012, "name" => "2012-2016", "sessions" => ["2013", "2012"]}] },
      "il-chicago" => { "_id" => "il-chicago", "abbreviation" => "il-chicago", "capitol_timezone" => "America/Chicago", "chambers" => { "upper" => { "name" => "Council", "title" => "Councilmember" } }, "feature_flags" => [], "latest_update" => Time.zone.parse("2013-11-11 03:00:04 UTC"), "legislature_name" => "Chicago City Council", "name" => "City of Chicago", "session_details" => { "2013" => { "_scraped_name" => "2013", "display_name" => "2013 Legislative Session", "type" => "primary" }, "2012" => { "_scraped_name" => "2012", "display_name" => "2012 Legislative Session", "type" => "primary" } }, "terms" => [{ "end_year" => 2016, "start_year" => 2012, "name" => "2012-2016", "sessions" => ["2013", "2012"] }] } }
  end

  private_class_method :create_seed_cities_metadata, :attribute_sets
end
