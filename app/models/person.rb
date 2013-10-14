# Billy
class Person
  include Mongoid::Document

  # authorization based on roles
  # i.e. a user.can_respond_as?(person) to answer questions
  resourcify :user_roles, role_cname: 'UserRole'

  # The person's jurisdiction.
  belongs_to :metadatum, foreign_key: 'state'
  # Questions addressed to the person.
  has_many :questions

  # a user identified as the person
  # potentially elected official's staff would also have a user account
  # identified as the same person, thus has_many
  has_many :identities

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

  index(_type: 1)
  index(state: 1)
  index(active: 1)
  index(chamber: 1) # only applicable to legislators

  scope :active, where(active: true).asc(:chamber, :family_name) # no index includes `last_name`

  delegate :signature_threshold, :biography, :links, to: :person_detail

  def self.only_types(types)
    where("_type" => { "$in" => types })
  end

  # non-chainable
  def self.criteria_for_types_for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: nil) if location.nil?

    criteria = distinct("_type").collect do |type|
      type.constantize.for_location(location)
    end
  end

  def self.for_location(location, api = nil)
    if self.name != "Person"
      raise "this class needs a real implementation of for_location"
    end
  end

  # non-chainable
  def self.results_for_location(location)
    if self.name != "Person"
      raise "should not be called from subclass"
    end

    count = 1
    results = []
    criteria_for_types_for_location(location).each do |criterium|
      if count == 1
        results = criterium
      else
        results = results + criterium
      end
      count += 1
    end
    results
  end

  def self.default_api
    OpenStatesLegislatorService
  end

  # for now, only run if we have a clean slate
  def self.load_from_apis_for_jurisdiction(abbreviation, api = nil, adapter = nil)
    return if self.connected_to(abbreviation).count > 0

    api ||= default_api.new
    api.parsed_results_for_jurisdiction(abbreviation).map do |attributes|
      new.load_from_apis!(attributes)
    end
  end

  # @todo needs spec
  def load_from_apis!(attributes, options = {})
    adapt(attributes, options).save!
    PersonDetailRetriever.new(self, options).retrieve!
    self
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

  # What political role does the person currently play?
  # Can be elected or something other like "adviser" or "spokesperson", etc.
  #
  # Expected to be fully meaningful in combination with class and perhaps
  # metadatum (e.g name of chamber for StateLegislator like "upper").
  #
  # Subclasses may populate with a dedicated field or dynamically based on
  # another value.
  #
  # Meant for programmatic use, all lower case.
  #
  # @return [String, nil]
  def political_position
    read_attribute(:political_position)
  end

  # Meant as common formal presentation of political position.
  #
  # Yeah, I know, it's presentation concern, but may be dynamically generated
  # in subclasses based on relation with metadatum and its own class.
  #
  # @return [String, nil]
  def political_position_title
    political_position ? political_position.humanize : nil
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
    Bill.where('sponsors.leg_id' => id)
  end

  # Returns the person's votes.
  def votes
    Vote.or({'yes_votes.leg_id' => id},
            {'no_votes.leg_id' => id},
            {'other_votes.leg_id' => id}) # no index
  end

  # Returns the person's committees.
  def committees
    ids = read_attribute(:roles).map { |x| x['committee_id'] }.compact
    if ids.empty?
      []
    else
      Committee.where(_id: { '$in' => ids }).to_a
    end
  end

  def verified?
    identities.where(status: 'verified').count > 0
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

  def adapt(attributes, options = {})
    adapter = options[:adapter]
    if adapter
      adapter.run(attributes)
    else
      self.attributes = attributes
    end

    # id cannot be mass assigned..., have to set it explictly
    # id = attributes['id']
    self
  end
end
