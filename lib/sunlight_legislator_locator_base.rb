# -*- coding: utf-8 -*-
# mixin for legislator locator functionality
# shared by OpenStates and Congress service classes
module SunlightLegislatorLocatorBase
  def ids_for(location)
    return [] unless location

    api_parse(results_for_location(location, fields: id_field))
      .inject([]) do |ids, result|
      ids << result[id_field]
    end
  end

  def parsed_results_for_jurisdiction(abbreviation, options = {})
    params = {
      state: format_abbreviation(abbreviation),
      apikey: key
    }.merge(options)

    api_parse(RestClient.get(legislators_url, params: params))
  end

  private
  def api_parse(data)
    JSON.parse data
  end

  def results_for_location(data, options = {})
    params = params_for_location(data).merge(options)

    RestClient.get geo_url, params: params
  end
end
