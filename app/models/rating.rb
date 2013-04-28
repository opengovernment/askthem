# Project VoteSmart
# @see http://api.votesmart.org/docs/Rating.html
class Rating
  include Mongoid::Document

  # The special interest_group doing the rating.
  belongs_to :rating_group, foreign_key: 'sigId', primary_key: 'sigId'
  # The scorecard from which this rating originates.
  belongs_to :rating_scorecard, foreign_key: 'ratingId', primary_key: 'ratingId'

  # Fields from the rating.
  field :candidateId, type: String
  field :rating, type: String

  # Fields from the scorecard.
  field :ratingText, type: String
  field :ratingName, type: String
  field :ratingText, type: String

  # Fields from the special interest group.
  field :name, type: String
  field :description, type: String

  index(ratingId: 1)
  index(sigId: 1)

  # @return [Person] the person being rated
  def person
    Person.with(session: 'openstates').where(votesmart_id: candidateId).first || # no index
      PersonDetail.where(votesmart_id: candidateId).first.person
  end
end
