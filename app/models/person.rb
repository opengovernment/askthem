# Billy
class Person
  include Mongoid::Document
  store_in collection: 'legislators'

  # The person's jurisdiction.
  belongs_to :metadatum, foreign_key: 'state'
  # Questions addressed to the person.
  has_many :questions
  # Special interest group ratings for the person.
  has_many :ratings

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

  scope :active, where(active: true).asc(:chamber, :family_name)

  # Stores Popolo fields that are not available in Billy.
  # @note `has_one` associations require a matching `belongs_to`, as they must
  #   be able to call `inverse_of_field`.
  def person_detail
    PersonDetail.where(person_id: id).first || PersonDetail.new(person: person)
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
    Vote.use(read_attribute(:state)).or({'yes_votes.leg_id' => id}, {'no_votes.leg_id' => id}, {'other_votes.leg_id' => id})
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
    if self['votesmart_id']
      url = "http://votesmart.org/candidate/"
      url += "#{section}/" if section
      url += self['votesmart_id']
    end
  end
end
