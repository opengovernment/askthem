# -*- coding: utf-8 -*-
require "spec_helper"

describe OpenStatesLegislatorService do
  let(:api) { OpenStatesLegislatorService.new }

  describe "#ids_for" do
    it "takes a location and returns matching state legislator ids", :vcr do
      legislator_ids = ["VTL000008", "VTL000009", "VTL000184", "VTL000095"]
      expect(api.ids_for("05602")).to eq legislator_ids
    end
  end

  describe "#parsed_results_for_jurisdiction" do
    it "returns matching state legislator data for juridisction", :vcr do
      expect(api.parsed_results_for_jurisdiction("vt").first).to eq legislator
    end

    def legislator
      {"last_name"=>"Quimby", "updated_at"=>"2013-10-03 03:01:45", "full_name"=>"Connie N. Quimby", "id"=>"VTL000301", "first_name"=>"Connie", "middle_name"=>"N", "district"=>"Essex-Caledonia", "state"=>"vt", "party"=>"Republican/Democratic", "csrfmiddlewaretoken"=>"6W0EVxLP4KAC1iZ0gGYjHaREUO0HtFaK", "email"=>"cquimby@leg.state.vt.us", "leg_id"=>"VTL000301", "active"=>true, "transparencydata_id"=>"d281d03c67914c7dbbc34f20a79a988d", "nickname"=>"", "photo_url"=>"", "url"=>"http://www.leg.state.vt.us/legdir/LegDirMain.cfm", "created_at"=>"2013-01-05 00:02:21", "chamber"=>"lower", "offices"=>[{"fax"=>nil, "name"=>"Mailing Address", "phone"=>nil, "address"=>"P.O. Box 373\n\nConcord, VT 05824-", "type"=>"district", "email"=>nil}, {"fax"=>nil, "name"=>"Home Address", "phone"=>"(802) 695-2575", "address"=>"579 Main St.\n\nConcord, VT 05824-", "type"=>"district", "email"=>"conquimbo@hotmail.com"}], "suffixes"=>""}
    end
  end
end
