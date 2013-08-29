# -*- coding: utf-8 -*-
require "spec_helper"
require "democracy_map"

describe DemocracyMap do
  let(:api) { DemocracyMap.new }

  describe "#governor_for" do
    it "hash of data from api for requested state", :vcr do
      data = api.governor_for("vt")
      expect(data["title"]).to eq "Governor"
      expect(data["name_full"]).to eq "Peter Shumlin"
      expect(data["state"]).to eq "vt"
    end
  end

  describe "#governors" do
    it "array of governor data for all states", :vcr do
      data = api.governors
      expect(data.size).to eq 50
    end
  end
end
