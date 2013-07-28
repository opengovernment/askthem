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
  field :timespan, type: String
  field :ratingName, type: String
  field :ratingText, type: String

  # Fields from the special interest group.
  field :name, type: String
  field :description, type: String

  index(ratingId: 1)
  index(sigId: 1)

  # @param [Person,nil] person the person being rated, or nil
  # @param [Metadatum,nil] person the person's jurisdiction, or nil
  # @return [String] a sentence explaining the rating
  def sentence(person = nil, metadatum = nil)
    if ratingText?
      person ||= self.person # avoid N+1 query
      metadatum ||= self.metadatum # avoid N+1 query
      sentence = ratingText
      sentence.sub!(/\[HOUSE\]/, metadatum.chamber_name(person.most_recent(:chamber)))
      sentence.sub!(/\[NAME\]/, person.name)
      sentence.sub!(/\[NUMBER\]/, rating)
      sentence.sub!(/\[ORGANIZATION\]/, name)
      sentence.sub!(/\[RATING\]/, rating)
      sentence.sub!(/\[TITLE\]/, metadatum.chamber_title(person.most_recent(:chamber)))
      sentence.sub!(/\[YEAR\]/, timespan? ? timespan : '')
      sentence.strip.squeeze(' ')
    end
  end

  # @return [Person] the person being rated
  def person
    Person.where(votesmart_id: candidateId).first || # no index
      PersonDetail.where(votesmart_id: candidateId).first.person
  end
end
