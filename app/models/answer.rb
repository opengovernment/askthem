class Answer
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :question
  belongs_to :user

  field :text, type: String

  # whether to show them on homepage or not
  # assumes only one answer flagged featured
  field :featured, type: Boolean

  validates_presence_of :text, :question_id, :user_id

  after_create :set_question_answered

  scope :featured, where(featured: true)

  private
  def set_question_answered
    if question.answered?
      question.answered = true
      question.save!
    end
  end
end
