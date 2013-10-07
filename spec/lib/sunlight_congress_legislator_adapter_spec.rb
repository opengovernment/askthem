# -*- coding: utf-8 -*-
require "spec_helper"
require "sunlight_congress_legislator_adapter"

describe SunlightCongressLegislatorAdapter do
  let(:federal_legislator) { FederalLegislator.new }
  let(:adapter) { SunlightCongressLegislatorAdapter.new(federal_legislator) }

  describe "#run" do
    it "takes congress data and returns suitable attributes" do
      adapter.run congress_attributes
      expect(federal_legislator.id).to eq "W000800"
    end

    def congress_attributes
      {"bioguide_id"=>"W000800", "birthday"=>"1947-05-02", "chamber"=>"house", "contact_form"=>"http://www.house.gov/formwelch/issue_subscribe.htm", "crp_id"=>"N00000515", "district"=>0, "facebook_id"=>"72680720883", "fax"=>"202-225-6790", "fec_ids"=>["H6VT00160", "H8VT00034"], "first_name"=>"Peter", "gender"=>"M", "govtrack_id"=>"412239", "icpsr_id"=>20750, "in_office"=>true, "last_name"=>"Welch", "middle_name"=>nil, "name_suffix"=>nil, "nickname"=>nil, "office"=>"2303 Rayburn House Office Building", "party"=>"D", "phone"=>"202-225-4115", "state"=>"VT", "state_name"=>"Vermont", "term_end"=>"2015-01-03", "term_start"=>"2013-01-03", "thomas_id"=>"01879", "title"=>"Rep", "twitter_id"=>"PeterWelch", "votesmart_id"=>51272, "website"=>"http://www.welch.house.gov", "youtube_id"=>"reppeterwelch"}
    end
  end
end
