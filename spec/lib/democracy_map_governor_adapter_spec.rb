# -*- coding: utf-8 -*-
require "spec_helper"
require "democracy_map_governor_adapter"

describe DemocracyMapGovernorAdapter do
  let(:governor) { FederalLegislator.new }
  let(:adapter) { DemocracyMapGovernorAdapter.new(governor) }

  describe "#run" do
    it "takes governor data and returns suitable attributes" do
      adapter.run governor_attributes
      expect(governor.full_name).to eq "Peter Shumlin"
    end

    def governor_attributes
      {"type"=>"executive", "title"=>"Governor", "description"=>nil, "name_given"=>nil, "name_family"=>nil, "name_full"=>"Peter Shumlin", "url"=>"http://governor.vermont.gov/", "url_photo"=>"http://www.nga.org/files/live/sites/NGA/files/images/Govimages/VT-SHUMLIN.JPG", "url_schedule"=>nil, "url_contact"=>nil, "email"=>nil, "phone"=>"+1-802-828-3333", "address_name"=>nil, "address_1"=>"109 State Street", "address_2"=>"Pavilion Office Building", "address_city"=>"Montpelier", "address_state"=>"VT", "address_zip"=>"05609", "current_term_enddate"=>nil, "last_updated"=>nil, "social_media"=>[{"type"=>"twitter", "description"=>"Twitter", "username"=>"vtgovernor", "url"=>"http://twitter.com/vtgovernor", "last_updated"=>nil}, {"type"=>"facebook", "description"=>"Facebook", "username"=>nil, "url"=>"http://www.facebook.com/pages/Vermont-Governor/155136287867671", "last_updated"=>nil}, {"type"=>"youtube", "description"=>"Youtube", "username"=>nil, "url"=>"http://www.youtube.com/user/VTGovernor", "last_updated"=>nil}], "state"=>"vt"}
    end
  end
end
