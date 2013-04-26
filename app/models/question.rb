class Question
  include Mongoid::Document
  include Mongoid::Timestamps
  store_in session: 'default' # @see https://github.com/mongoid/mongoid/pull/2909

  # The jurisdiction in which the question is asked.
  belongs_to :metadatum, foreign_key: 'state'
  # The author of the question.
  belongs_to :user
  # The person to whom the question is addressed.
  belongs_to :person
  # The bill the question is about.
  belongs_to :bill
  # The signatures in support of the question.
  has_many :signatures

  # The question's summary.
  field :title, type: String
  # The question's content.
  field :body, type: String
  # The question's issue area.
  field :subject, type: String
  # The number of signatures.
  field :signature_count, type: Integer, default: 0
  # Whether the question is answered.
  # @note Use `update_attribute`, not `set`, to trigger the observers.
  field :answered, type: Boolean, default: false

  validates_presence_of :state, :user_id, :person_id, :title, :body
  validates_length_of :title, within: 3..60, allow_blank: true
  validates_length_of :body, minimum: 60, allow_blank: true
  validate :state_must_be_included_in_the_list_of_states
  validate :subject_must_be_included_in_the_list_of_subjects

private
  def state_must_be_included_in_the_list_of_states
    unless state.blank? || Metadatum.find_by_abbreviation(state)
      errors.add(:state, 'is not included in the list of states')
    end
  end

  def subject_must_be_included_in_the_list_of_subjects
    unless subject.blank? || Bill.in(state).distinct('subjects').include?(subject)
      errors.add(:subject, 'is not included in the list of subjects')
    end
  end
end
