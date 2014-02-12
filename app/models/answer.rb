class Answer
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :question
  belongs_to :user

  field :text, type: String

  validates_presence_of :text, :question_id, :user_id

  after_create :set_question_answered

  private
  def set_question_answered
    if question.answered?
      question.answered = true
      question.save!
    end
  end
end
