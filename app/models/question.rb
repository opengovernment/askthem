class Question
  include Mongoid::Document
  include Mongoid::Timestamps
  store_in session: 'default'

  belongs_to :metadatum, foreign_key: 'state'
  belongs_to :user
  has_many :signatures

  # The question's jurisdiction.
  field :state, type: String
  # The question's summary.
  field :title, type: String
  # The question's content.
  field :body, type: String
  # The question's issue area.
  field :subject, type: String
  # The number of signatures.
  field :signature_count, default: 0

  # @todo add more message fields (to whom it is addressed) and context fields
  #   (if the question is about a bill) and other parts of PublicMail

  validates_presence_of :title, :body, :state
  validates_length_of :title, within: 3..60, allow_blank: true
  validates_length_of :body, minimum: 60, allow_blank: true
  validate :state_must_be_included_in_the_list_of_states
  validate :subject_must_be_included_in_the_list_of_subjects

private
  def state_must_be_included_in_the_list_of_states
    unless state.blank? || Metadatum.where(state: state).first
      errors.add(:state, 'is not included in the list of states')
    end
  end

  def subject_must_be_included_in_the_list_of_subjects
    unless subject.blank? || Bill.where(state: state).distinct('subjects').includes?(subject)
      errors.add(:subject, 'is not included in the list of subjects')
    end
  end
end
