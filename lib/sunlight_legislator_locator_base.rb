# -*- coding: utf-8 -*-
# mixin for legislator locator functionality
# shared by OpenStates and Congress service classes
module SunlightLegislatorLocatorBase
  def ids_for(location)
    ids = []
    data = geodata_from(location)

    if location_is_valid? data
      api_parse(results_for_location(data, fields: id_field)).map do |result|
        ids << result[id_field]
      end
    end

    ids
  end

  def parsed_results_for_jurisdiction(abbreviation, options = {})
    params = {
      state: format_abbreviation(abbreviation),
      apikey: key
    }.merge(options)

    api_parse(RestClient.get(legislators_url, params: params))
  end

  private
  def geodata_from(location)
    if location.is_a?(Geocoder::Result::Base)
      location
    else
      Geocoder.search(location).first
    end
  end

  def location_is_valid?(data)
    data &&
      data.country_code == 'US' &&
      data.latitude.nonzero? &&
      data.longitude.nonzero?
  end

  def api_parse(data)
    JSON.parse data
  end

  def results_for_location(data, options = {})
    params = params_for_location(data).merge(options)

    RestClient.get geo_url, params: params
  end
end
