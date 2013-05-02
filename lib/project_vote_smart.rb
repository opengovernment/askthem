# A simple wrapper for the Project VoteSmart API.
class ProjectVoteSmart
  class Error < StandardError; end

  # @params [Hash] opts optional arguments
  # @option opts [String] :api_key a Project VoteSmart API key
  def initialize(opts = {})
    @api_key = opts[:api_key]
  end

  # @param [String] endpoint the API endpoint
  # @param [Hash] params the API request's parameters
  def get(endpoint, params = {})
    result = JSON.parse(RestClient.get("http://api.votesmart.org/#{endpoint}", params: params.merge(key: @api_key, o: 'JSON')))

    if result['error']
      raise ProjectVoteSmart::Error, result['error']['errorMessage']
    end

    if result.size == 1
      result = result[result.keys.first]
      if result.key?('generalInfo')
        result.delete('generalInfo')
      end
      if result.size == 1
        result = result[result.keys.first]
      end
    end

    result
  rescue RestClient::ResourceNotFound
    raise ProjectVoteSmart::Error, 'HTTP 404 Not Found'
  end
end
