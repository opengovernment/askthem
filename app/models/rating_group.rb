# Project VoteSmart
#
# A special interest group can belong to multiple categories, so we would need
# a HABTM association between the two. This information is not directly
# available in the API. We should also verify if a special interest group can
# ever assign a rating whose categories are outside its own categories.
#
# @see http://api.votesmart.org/docs/Rating.html
class RatingGroup
  include Mongoid::Document

  # The special interest group's scorecards.
  has_many :rating_scorecards, foreign_key: 'sigId', primary_key: 'sigId'
  # The special interest group's ratings.
  has_many :ratings, foreign_key: 'sigId', primary_key: 'sigId'

  index(sigId: 1)

  field :parentId, type: String # always -1
  field :stateId, type: String # always "NA"
  field :name, type: String
  field :description, type: String
  field :address, type: String
  field :city, type: String
  field :state, type: String
  field :zip, type: String
  field :phone1, type: String
  field :phone2, type: String
  field :fax, type: String
  field :email, type: String
  field :url, type: String
  field :contactName, type: String
end
