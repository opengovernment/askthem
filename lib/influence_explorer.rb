# -*- coding: utf-8 -*-
# A simple wrapper for the Influence Explorer API.
class InfluenceExplorer
  attr_accessor :api_key

  # @params [Hash] options optional arguments
  # @option options [String] :api_key a Influence Explorer API key
  def initialize(options = {})
    @api_key = options[:api_key] || ENV['SUNLIGHT_API_KEY']
  end

  def data_for(id)
    JSON.parse(get(id.strip))
  end

  private
  def base_api_url
    'http://transparencydata.com/api/1.0/entities/'
  end

  def get(id)
    wait = 1
    begin
      RestClient.get "#{base_api_url}#{id}.json", params: { apikey: api_key }
    rescue Errno::ECONNRESET, RestClient::ServerBrokeConnection
      wait *= 2 # exponential backoff
      sleep wait
      retry
    end
  end
end
