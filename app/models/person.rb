# Billy
class Person
  include Mongoid::Document
  store_in collection: 'legislators'

  # The person's jurisdiction.
  belongs_to :metadatum, foreign_key: 'state'
  # Questions addressed to the person.
  has_many :questions

  # Popolo fields and aliases.
  field :full_name, type: String, as: :name
  field :leg_id, type: String, as: :slug
  field :last_name, type: String, as: :family_name
  field :first_name, type: String, as: :given_name
  field :middle_name, type: String, as: :additional_name
  field '+title', type: String, as: :honorific_prefix # always "" in OpenStates
  field :suffixes, type: String, as: :honorific_suffix
  field :email, type: String
  field '+gender', type: String, as: :gender
  field :photo_url, type: String, as: :image

  scope :active, where(active: true).asc(:chamber, :family_name) # no index includes `last_name`

  def self.only_type(type)
    if type == 'Person'
      # handle legacy where api sets _type to 'person'
      where('_type' => { '$in' => [type, type.downcase, nil] })
    else
      where('_type' => type)
    end
  end

  # override in subclass for other apis
  def self.api_id_field
    'id'
  end

  # override in subclass for other apis
  def self.api_key
    ENV['SUNLIGHT_API_KEY']
  end

  # override in subclass for other apis
  def self.base_api_url
    'http://openstates.org/api/v1/legislators/'
  end

  # assumes only one matching location
  # openstates as default API
  # override base_api_key and api_geo_url in subclasses
  # to work with other apis
  def self.for_location(location)
    ids = []
    data = Geocoder.search(location).first

    if location_is_valid? data
      api_parse(results_for_location(data, fields: api_id_field)).map do |attributes|
        ids << attributes[api_id_field]
      end
    end

    where(:id.in => ids)
  end

  # for now, only run if we have a clean slate
  def self.load_from_apis_for_jurisdiction(abbreviation)
    return if self.in(abbreviation).count > 0

    api_parse(results_for_jurisdiction(abbreviation)).map do |attributes|
      create_from_apis attributes
    end
  end

  def self.create_from_apis(attributes, options = {})
    person = build_from_api(attributes)
    person.save!

    PersonDetailRetriever.new(person, options).retrieve!

    person
  end

  # Inactive legislators will not have top-level `chamber` or `district` fields.
  #
  # @param [String,Symbol] `:chamber` or `:district`
  # @return [String,nil] the chamber, the district, or nil
  def most_recent(attribute)
    if read_attribute(attribute)
      read_attribute(attribute)
    else
      read_attribute(:old_roles).to_a.reverse.each do |_, roles|
        if roles
          roles.each do |role|
            return role[attribute.to_s] if role[attribute.to_s]
          end
        end
      end
      nil # don't return the enumerator
    end
  end

  # TODO: add spec
  def jurisdiction
    Metadatum.with(session: 'openstates').find_by_abbreviation(state)
  end

  # TODO: add spec
  def most_recent_chamber
    most_recent :chamber
  end

  # TODO: add spec
  def most_recent_chamber_title
    jurisdiction.chamber_title most_recent_chamber
  end

  def most_recent_district
    most_recent :district
  end

  # Returns fields that are not available in Billy.
  #
  # @return [PersonDetail] the person's additional fields
  # @note `has_one` associations require a matching `belongs_to`, as they must
  #   be able to call `inverse_of_field`.
  def person_detail
    PersonDetail.where(person_id: id).first || PersonDetail.new(person: self)
  end

  # Returns the person's special interest group ratings.
  def ratings
    Rating.where(candidateId: votesmart_id || person_detail.votesmart_id)
  end

  # Returns questions answered by the person.
  def questions_answered
    questions.where(answered: true)
  end

  # Returns the person's sponsored bills.
  def bills
    Bill.use(read_attribute(:state)).where('sponsors.leg_id' => id)
  end

  # Returns the person's votes.
  def votes
    Vote.use(read_attribute(:state)).or({'yes_votes.leg_id' => id}, {'no_votes.leg_id' => id}, {'other_votes.leg_id' => id}) # no index
  end

  # Returns the person's committees.
  def committees
    ids = read_attribute(:roles).map{|x| x['committee_id']}.compact
    if ids.empty?
      []
    else
      Committee.use(read_attribute(:state)).where(_id: {'$in' => ids}).to_a
    end
  end

  def votesmart_id
    read_attribute(:votesmart_id)
  end

  def votesmart_biography_url
    votesmart_url('biography')
  end
  def votesmart_evaluations_url
    votesmart_url('evaluations')
  end
  def votesmart_key_votes_url
    votesmart_url('key-votes')
  end
  def votesmart_public_statements_url
    votesmart_url('public-statements')
  end
  def votesmart_campaign_finance_url
    votesmart_url('campaign-finance')
  end

  private
  def votesmart_url(section = nil)
    if votesmart_id
      url = "http://votesmart.org/candidate/"
      url += "#{section}/" if section
      url += votesmart_id
    end
  end

  def self.api_geo_url
    "#{base_api_url}geo/"
  end

  def self.location_is_valid?(data)
    data.country_code == 'US' && data.latitude.nonzero? && data.longitude.nonzero?
  end

  def self.result_for_single(id)
    params = {
      apikey: api_key
    }

    RestClient.get "#{base_api_url}#{id}/", params: params
  end

  def self.params_for_location(data)
    { lat: data.latitude,
      long: data.longitude,
      apikey: api_key }
  end

  def self.results_for_location(data, options = {})
    params = params_for_location(data).merge(options)

    RestClient.get api_geo_url, params: params
  end

  def self.api_parse(data)
    JSON.parse data
  end

  def self.api_url_for_jurisdiction
    base_api_url
  end

  def self.api_format_abbreviation(abbreviation)
    abbreviation.downcase
  end

  def self.results_for_jurisdiction(abbreviation, options = {})
    params = {
      state: api_format_abbreviation(abbreviation),
      apikey: api_key
    }.merge(options)

    RestClient.get api_url_for_jurisdiction, params: params
  end

  def self.build_from_api(attributes)
    person = with(session: 'openstates').new(attributes)
    # id cannot be mass assigned..., have to set it explictly
    person.id = attributes['id']
    person
  end

  # class methods have do not honor private declaration
  private_class_methods = [:build_from_api, :results_for_jurisdiction,
                           :api_format_abbreviation, :api_url_for_jurisdiction,
                           :api_parse, :results_for_location,
                           :params_for_location, :result_for_single,
                           :location_is_valid?, :api_geo_url]
  private_class_method *private_class_methods
end
