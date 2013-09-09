class MinutesDocument
  include Mongoid::Document

  embedded_in :meeting

  field :url, type: String
  field :full_text, type: String

  validates_presence_of :url
end
