# used for populating new instances of Metadatum
# for all states jurisdictions
# includes District of Columbia and Puerto Rico
class Metadatum::State
  OPENSTATES_SESSION = 'openstates'

  def self.api_key
    ENV['SUNLIGHT_API_KEY']
  end

  # http://sunlightlabs.github.io/openstates-api/metadata.html
  def self.api_base_url
    'http://openstates.org/api/v1/metadata/'
  end

  def self.create_states_if_none
    has_states = Metadatum.with(session: OPENSTATES_SESSION)
      .nin(abbreviation: Metadatum::Us::ABBREVIATION)
      .collect(&:abbreviation).sort

    unless has_states == OpenGovernment::STATES.values.sort
      create_states_from_api
    end
  end

  def self.create_states_from_api
    # get the metadatum in one go
    attributes = JSON.parse(results_from_api)
    attributes.each do |attributes|
      Metadatum.with(session: OPENSTATES_SESSION).create! attributes
    end
  end

  def self.api_fields
    %w(abbreviation capital_timezone chambers feature_flags latest_csv latest_csv_url latest_json_date latest_json_url latest_update legislature_name legislature_url name session_details terms)
  end

  def self.results_from_api(options = {})
    params = {
      fields: api_fields.join(','),
      apikey: api_key
    }.merge(options)

    RestClient.get api_base_url, params: params
  end

  private_class_method :results_from_api, :api_fields
end
