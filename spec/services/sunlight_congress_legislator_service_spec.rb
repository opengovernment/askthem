# -*- coding: utf-8 -*-
require "spec_helper"

describe SunlightCongressLegislatorService do
  let(:api) { SunlightCongressLegislatorService.new }

  describe "#ids_for" do
    it "takes a location and returns matching federal legislator ids", :vcr do
      legislator_ids = ["W000800", "L000174", "S000033"]
      location = Geocoder.search("05602").first
      expect(api.ids_for(location)).to eq legislator_ids
    end
  end

  describe "#parsed_results_for_jurisdiction" do
    it "returns matching federal legislator data for juridisction", :vcr do
      expect(api.parsed_results_for_jurisdiction("vt").first).to eq legislator
    end

    def legislator
      {"bioguide_id"=>"W000800", "birthday"=>"1947-05-02", "chamber"=>"house", "contact_form"=>"http://www.house.gov/formwelch/issue_subscribe.htm", "crp_id"=>"N00000515", "district"=>0, "facebook_id"=>"72680720883", "fax"=>"202-225-6790", "fec_ids"=>["H6VT00160", "H8VT00034"], "first_name"=>"Peter", "gender"=>"M", "govtrack_id"=>"412239", "icpsr_id"=>20750, "in_office"=>true, "last_name"=>"Welch", "middle_name"=>nil, "name_suffix"=>nil, "nickname"=>nil, "ocd_id"=>"ocd-division/country:us/state:vt", "office"=>"2303 Rayburn House Office Building", "party"=>"D", "phone"=>"202-225-4115", "state"=>"VT", "state_name"=>"Vermont", "term_end"=>"2015-01-03", "term_start"=>"2013-01-03", "thomas_id"=>"01879", "title"=>"Rep", "twitter_id"=>"PeterWelch", "votesmart_id"=>51272, "website"=>"http://www.welch.house.gov", "youtube_id"=>"reppeterwelch"}
    end
  end
end
