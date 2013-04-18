# A URL for a document about a person.
# @note From Popolo.
class Link
  include Mongoid::Document

  embedded_in :person_detail

  # A URL for a document about a person.
  field :url, type: String
  # A note, e.g. 'Wikipedia page'.
  field :note, type: String

  validates_presence_of :url
end
