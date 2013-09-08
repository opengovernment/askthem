class Answer
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :question
  belongs_to :user

  field :text, type: String

  validates_presence_of :text, :question_id, :user_id
end
