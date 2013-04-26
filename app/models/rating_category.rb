# Project VoteSmart
class RatingCategory
  include Mongoid::Document

  field :categoryId, type: String
  field :name, type: String

  # Returns the category's ratings.
  def ratings
    Rating.where(categories: categoryId)
  end
end
