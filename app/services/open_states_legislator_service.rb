# -*- coding: utf-8 -*-
require "sunlight_legislator_locator_base"

# A wrapper for the Open States API.
class OpenStatesLegislatorService
  # public interface is defined in mixin
  include SunlightLegislatorLocatorBase

  attr_accessor :key, :base_url, :legislators_url, :id_field

  def initialize
    @key = ENV['SUNLIGHT_API_KEY']
    @base_url = "http://openstates.org/api/v1/"
    @legislators_url = "#{base_url}legislators/"
    @id_field = "id"
  end

  private
  def geo_url
    "#{legislators_url}geo/"
  end

  def params_for_location(data)
    { lat: data.latitude,
      long: data.longitude,
      apikey: key }
  end

  def format_abbreviation(abbreviation)
    abbreviation.downcase
  end
end
