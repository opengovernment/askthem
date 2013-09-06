class Answer
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :question

  field :text, type: String

  validates_presence_of :text, :question_id
end
