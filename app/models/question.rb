# @todo stub
class Question
  include Mongoid::Document
  include Mongoid::Timestamps
  store_in session: 'default'

  belongs_to :user
  has_many :signatures

  # @todo cache counter on signatures

  # The question's summary.
  field :title, type: String
  # The question's content.
  field :body, type: String
  # The question's issue area.
  field :subject, type: String
  # The question's state
  field :state, type: String

  validates_presence_of :title, :body
  validates_length_of :title, within: 3..60, allow_blank: true
  validates_length_of :body, minimum: 60, allow_blank: true
  validates_inclusion_of :subject, in: ['@todo'], allow_blank: true
end
