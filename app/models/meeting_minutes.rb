class MeetingMinutes
  include Mongoid::Document

  field :meeting_id, type: String
  field :url, type: String
  field :fulltext, type: String

  validates_presence_of :meeting_id, :url, :fulltext
end