class Answer
  include Mongoid::Document
  include Mongoid::Timestamps
  include AutoHtmlFor

  belongs_to :question
  belongs_to :user

  field :text, type: String

  # whether to show them on homepage or not
  # assumes only one answer flagged featured
  field :featured, type: Boolean

  validates_presence_of :text, :question_id, :user_id

  after_create :set_question_answered
  after_destroy :set_question_unanswered

  auto_html_for :text do
    html_escape
    hashtag
    image(width: 425)
    dailymotion(width: 400, height: 250, autoplay: true)
    vimeo(width: 400, height: 250, autoplay: true)
    youtube(width: 400, height: 250, autoplay: true)
    link
    simple_format
  end

  scope :featured, where(featured: true)

  private
  def set_question_answered
    if question.answered?
      question.answered = true
      question.save!
    end
  end

  def set_question_unanswered
    unless question.answered?
      question.answered = false
      question.save!
    end
  end
end
