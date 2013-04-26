# Project VoteSmart
class Rating
  include Mongoid::Document

  # The special interest_group doing the rating.
  belongs_to :rating_group, foreign_key: 'sigId', primary_key: 'sigId'

  field :sigId, type: String
  field :ratingId, type: String
  field :categories, type: Array
  field :timespan, type: String
  field :rating, type: String
  field :ratingName, type: String
  field :ratingText, type: String

  # The person being rated.
  field :person_id, type: String

  # Returns the rating's categories.
  def categories
    RatingCategory.find(categories)
  end

  # @return [Person] the person being rated
  # @note Only OpenStates people have ratings.
  def person
    Person.with(session: 'openstates').find(person_id)
  end
end
