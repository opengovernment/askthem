# Project VoteSmart
# @see http://api.votesmart.org/docs/Rating.html
class RatingScorecard
  include Mongoid::Document

  # The scorecard's special interest_group.
  belongs_to :rating_group, foreign_key: 'sigId', primary_key: 'sigId'
  # The scorecard's ratings.
  has_many :ratings, foreign_key: 'ratingId', primary_key: 'ratingId'

  index(ratingId: 1)
  index(sigId: 1)
  index(retrieved: 1)

  # A time span in the format `YYYY` or `YYYY-YYYY`, or the empty string.
  field :timespan, type: String
  # One of roughly 189 names for the scorecard.
  field :ratingName, type: String
  # One of roughly 105 templates to describe what the scorecard is about.
  field :ratingText, type: String

  # Fields from the special interest group.
  field :name, type: String
  field :description, type: String

  # When the scorecard's ratings were retrieved.
  field :retrieved, type: Time
end
