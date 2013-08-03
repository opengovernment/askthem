class Agenda
  include Mongoid::Document

  embedded_in :meeting

  field :url, type: String
  field :fulltext, type: String

  validates_presence_of :url, :fulltext
end
