# Project VoteSmart
# @see http://api.votesmart.org/docs/Rating.html
class Rating
  include Mongoid::Document

  # The special interest_group doing the rating.
  belongs_to :rating_group, foreign_key: 'sigId', primary_key: 'sigId'
  # The scorecard from which this rating originates.
  belongs_to :rating_scorecard, foreign_key: 'ratingId', primary_key: 'ratingId'

  index(person_id: 1, ratingId: 1)
  index(ratingId: 1)
  index(sigId: 1)

  # The person's jurisdiction.
  field :state, type: String
  # The person being rated.
  field :person_id, type: String
  # The person's rating.
  field :rating, type: String

  # Fields from the scorecard.
  field :ratingText, type: String
  field :ratingName, type: String
  field :ratingText, type: String

  # Fields from the special interest group.
  field :name, type: String
  field :description, type: String

  validates_presence_of :state, :person_id

  # @return [Metadatum] the jurisdiction in which the question is asked
  def metadatum
    Metadatum.find_by_abbreviation(state)
  end

  # @return [Person] the person being rated
  def person
    Person.use(state).find(person_id)
  end

  # @param [Person] person a person
  def person=(person)
    self.person_id = person.id
    self.state = person['state']
  end
end
