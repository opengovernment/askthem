# -*- coding: utf-8 -*-
require "sunlight_legislator_locator_base"

# A wrapper for the Sunlight Congress API.
class SunlightCongressLegislatorService
  # public interface is defined in mixin
  include SunlightLegislatorLocatorBase

  attr_accessor :key, :base_url, :legislators_url, :id_field

  def initialize
    @key = ENV['SUNLIGHT_API_KEY']
    @base_url = "https://congress.api.sunlightfoundation.com/"
    @legislators_url = "#{base_url}legislators/"
    @id_field = "bioguide_id"
  end

  private
  def api_parse(data)
    JSON.parse(data)['results']
  end

  def geo_url
    "#{legislators_url}locate"
  end

  def params_for_location(data)
    { latitude: data.latitude,
      longitude: data.longitude,
      apikey: key }
  end

  def format_abbreviation(abbreviation)
    abbreviation.upcase
  end
end
