# -*- coding: utf-8 -*-
require "spec_helper"

describe DemocracyMapGovernorService do
  let(:api) { DemocracyMapGovernorService.new }

  describe "#parsed_results_for_jurisdiction" do
    it "returns matching governor data for juridisction as array", :vcr do
      expect(api.parsed_results_for_jurisdiction("vt")).to eq [governor]
    end

    def governor
      {"type"=>"executive", "title"=>"Governor", "description"=>nil, "name_given"=>nil, "name_family"=>nil, "name_full"=>"Peter Shumlin", "url"=>"http://governor.vermont.gov/", "url_photo"=>"http://www.nga.org/files/live/sites/NGA/files/images/Govimages/VT-SHUMLIN.JPG", "url_schedule"=>nil, "url_contact"=>nil, "email"=>nil, "phone"=>"+1-802-828-3333", "address_name"=>nil, "address_1"=>"109 State Street", "address_2"=>"Pavilion Office Building", "address_city"=>"Montpelier", "address_state"=>"VT", "address_zip"=>"05609", "current_term_enddate"=>nil, "last_updated"=>nil, "social_media"=>[{"type"=>"twitter", "description"=>"Twitter", "username"=>"vtgovernor", "url"=>"http://twitter.com/vtgovernor", "last_updated"=>nil}, {"type"=>"facebook", "description"=>"Facebook", "username"=>nil, "url"=>"http://www.facebook.com/pages/Vermont-Governor/155136287867671", "last_updated"=>nil}, {"type"=>"youtube", "description"=>"Youtube", "username"=>nil, "url"=>"http://www.youtube.com/user/VTGovernor", "last_updated"=>nil}], "state"=>"vt"}
    end
  end

  describe "#governor_for" do
    it "hash of data from api for requested state", :vcr do
      data = api.governor_for("vt")
      expect(data["title"]).to eq "Governor"
      expect(data["name_full"]).to eq "Peter Shumlin"
      expect(data["state"]).to eq "vt"
    end
  end
end
