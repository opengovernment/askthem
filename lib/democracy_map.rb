# -*- coding: utf-8 -*-
# A simple wrapper for the Democracy Map API.
class DemocracyMap
  def governor_for(state)
    result = JSON.parse(get(state))
    data = parse_state_from(result["jurisdictions"])
    data = data["elected_office"].select { |d| d["title"] == "Governor" }.first
    governor = data.merge({ "state" => state.downcase })
  end

  def governors
    # drop non-states from array
    states = OpenGovernment::STATES.values - ['dc', 'pr']
    states.collect { |state| governor_for(state) }
  end

  private
  def base_api_url
    "http://api.democracymap.org/context?location="
  end

  def get(location)
    wait = 1
    begin
      RestClient.get "#{base_api_url}#{location}", accept: :json
    rescue Errno::ECONNRESET, RestClient::ServerBrokeConnection
      wait *= 2 # exponential backoff
      sleep wait
      retry
    end
  end

  def parse_state_from(jurisdictions)
    state_matches = jurisdictions.select do |jurisdiction|
      jurisdiction["type"] == "government" &&
        jurisdiction["type_name"] == "State"
    end
    state_matches.first
  end
end
