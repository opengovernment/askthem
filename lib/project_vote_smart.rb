# -*- coding: utf-8 -*-
# A simple wrapper for the Project VoteSmart API.
class ProjectVoteSmart
  class Error < StandardError; end
  class EndpointNotFound < Error; end
  class DocumentNotFound < Error; end

  # Based on API documentation. Not all endpoints have been tested.
  LIST_ENDPOINTS = [
    # http://api.votesmart.org/docs/Address.html
    'Address.getOfficeByOfficeState',
    # http://api.votesmart.org/docs/Measure.html
    'Measure.getMeasuresByYearState',
    # http://api.votesmart.org/docs/Candidates.html
    'Candidates.getByOfficeState',
    'Candidates.getByOfficeTypeState',
    'Candidates.getByLastname',
    'Candidates.getByLevenshtein',
    'Candidates.getByElection',
    'Candidates.getByDistrict',
    # http://api.votesmart.org/docs/Committee.html
    'Committee.getTypes',
    'Committee.getCommitteesByTypeState',
    # http://api.votesmart.org/docs/District.html
    'District.getByOfficeState',
    # http://api.votesmart.org/docs/Election.html
    'Election.getElection',
    'Election.getElectionByYearState',
    'Election.getElectionByZip', # hmm, all other zip methods include a zipMessage
    'Election.getStageCandidates',
    # http://api.votesmart.org/docs/Leadership.html
    'Leadership.getPositions',
    'Leadership.getOfficials',
    # http://api.votesmart.org/docs/Local.html
    'Local.getCounties',
    'Local.getCities',
    'Local.getOfficials',
    # http://api.votesmart.org/docs/Office.html
    'Office.getTypes',
    'Office.getBranches',
    'Office.getLevels',
    'Office.getOfficesByType',
    'Office.getOfficesByLevel',
    'Office.getOfficesByTypeLevel',
    'Office.getOfficesByBranchLevel',
    # http://api.votesmart.org/docs/Officials.html
    'Officials.getStatewide',
    'Officials.getByOfficeState',
    'Officials.getByOfficeTypeState',
    'Officials.getByLastname',
    'Officials.getByLevenshtein',
    'Officials.getByDistrict',
    # http://api.votesmart.org/docs/Rating.html
    'Rating.getCategories',
    'Rating.getSigList',
    'Rating.getRating',
    # http://api.votesmart.org/docs/State.html
    'State.getStateIDs',
    # http://api.votesmart.org/docs/Votes.html
    'Votes.getCategories',
    'Votes.getBillActionVotes',
    'Votes.getByBillNumber',
    'Votes.getBillsByCategoryYearState',
    'Votes.getBillsByYearState',
    'Votes.getBillsByOfficialYearOffice',
    'Votes.getBillsByOfficialCategoryOffice',
    'Votes.getByOfficial',
    'Votes.getBillsBySponsorYear',
    'Votes.getBillsBySponsorCategory',
    'Votes.getBillsByStateRecent',
    'Votes.getVetoes',
  ]

  # Sets the API key on the API client.
  #
  # @params [Hash] opts optional arguments
  # @option opts [String] :api_key a Project VoteSmart API key
  def initialize(opts = {})
    @api_key = opts[:api_key] || ENV['PROJECT_VOTE_SMART_API_KEY']
  end

  # Sends a request to the Project VoteSmart API and returns the response in a
  # somewhat more consistent format than provided by the API.
  #
  # @param [String] endpoint the API endpoint
  # @param [Hash] params the API request's parameters
  # @see http://api.votesmart.org/docs/common.html
  # @see http://api.votesmart.org/docs/State.html
  def get(endpoint, params = {})
    begin
      result = JSON.parse(RestClient.get("http://api.votesmart.org/#{endpoint}", params: params.merge(key: @api_key, o: 'JSON')))

      if result['error']
        if result['error']['errorMessage'][/\ANo (bill|categor|official|rating|SIG)/i]
          raise ProjectVoteSmart::DocumentNotFound, result['error']['errorMessage']
        else
          raise ProjectVoteSmart::Error, result['error']['errorMessage']
        end
      end

      # There is always a root element.
      if result.size == 1
        result = result[result.keys.first]
        # State.getStateIDs (uniquely) adds an extra layer of nesting.
        if result.key?('list')
          result = result['list']
        # We want to access the key that's not "generalInfo".
        elsif result.key?('generalInfo')
          result.delete('generalInfo')
        end
        # If there is only one key besides "generalInfo".
        if result.size == 1
          result = result[result.keys.first]
        end
        # If there is a single result, Project VoteSmart will not wrap it in an array.
        if LIST_ENDPOINTS.include?(endpoint)
          result = [result] unless Array === result
        end
      end

      result
    rescue Errno::ETIMEDOUT, RestClient::ServerBrokeConnection
      wait *= 2 # exponential backoff
      sleep wait
      retry
    end
  rescue RestClient::ResourceNotFound
    raise ProjectVoteSmart::EndpointNotFound, 'HTTP 404 Not Found'
  end

  def officials_by_state_and_office(state_id, office_ids)
    office_ids.each_with_index do |office_id, index|
      begin
        return get('Officials.getByOfficeState',
                   officeId: office_id,
                   stateId: state_id.upcase)

      rescue ProjectVoteSmart::DocumentNotFound => e
        raise e if index + 1 == office_ids.size # if none of the officeIds work
      end
    end
  end

  # @see http://api.votesmart.org/docs/semi-static.html
  def office_ids(options)
    # Chairman, Councilmember
    return [347, 368] if options[:state] == 'dc'

    # State Assembly, State House
    return [7, 8] if options[:chamber] == 'lower'

    # State Senate
    [9]
  end
end
