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

  # assumes only one matching location
  # currently limited to openstates
  # TODO: add OgLocal API
  # TODO: add other relevant APIs
  def self.for_location(location)
    ids = Array.new
    data = Geocoder.search(location).first # request.location geocodes by IP
    if data.country_code == 'US' && data.latitude.nonzero? && data.longitude.nonzero?
      ids = JSON.parse(RestClient.get('http://openstates.org/api/v1/legislators/geo/', params: {
        fields: 'id',
        lat: data.latitude,
        long: data.longitude,
        apikey: ENV['SUNLIGHT_API_KEY'],
      })).map do |legislator|
        legislator['id']
      end
    end
    where(:id.in => ids)
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
        roles.each do |role|
          return role[attribute.to_s] if role[attribute.to_s]
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
    Rating.where(candidateId: read_attribute(:votesmart_id) || person_detail.votesmart_id)
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
    if read_attribute(:votesmart_id)
      url = "http://votesmart.org/candidate/"
      url += "#{section}/" if section
      url += read_attribute(:votesmart_id)
    end
  end
end
