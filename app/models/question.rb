class Question
  include Mongoid::Document
  include Mongoid::Timestamps
  include AutoHtmlFor

  # The author of the question.
  belongs_to :user
  accepts_nested_attributes_for :user

  # The signatures in support of the question.
  has_many :signatures, dependent: :destroy

  # The official answer to the question
  has_many :answers, dependent: :destroy

  # for uploaded photo or video
  mount_uploader :media, MediaUploader

  # The jurisdiction in which the question is asked.
  field :state, type: String
  # The person to whom the question is addressed.
  field :person_id, type: String
  # The bill the question is about.
  field :bill_id, type: String
  # The question's summary.
  field :title, type: String
  # The question's content.
  field :body, type: String
  # The question's issue area.
  field :subject, type: String
  # The questions's time of publication.
  field :issued_at, type: Time

  # based on asking user at time of question creation
  # since we aren't geocoding directly, don't need geocoder stuff
  field :coordinates, type: Array

  # alternative to uploaded photo or video
  # remotely hosted media (think youtube, vimeo)
  # note that "_file_" is added to avoid name conflict
  # with carrierwave generated methods for media uploader
  field :media_file_url, type: String

  # local cache of the number of signatures
  field :signature_count, type: Integer, default: 0
  field :threshold_met, type: Boolean, default: false

  field :answered, type: Boolean, default: false

  field :delivered, type: Boolean, default: false

  index(state: 1)
  index(person_id: 1, answered: 1)
  index(bill_id: 1, answered: 1)
  index({ coordinates: "2d" }, { background: true })

  validates_presence_of :state, :person_id, :user_id, :title
  validates_length_of :title, within: 3..100, allow_blank: true
  validate :state_must_be_included_in_the_list_of_states
  validate :subject_must_be_included_in_the_list_of_subjects
  validate :question_and_person_must_belong_to_the_same_jurisdiction
  validate :person_and_bill_must_belong_to_the_same_jurisdiction
  validates :media_file_url, :uri => { accessible: true, allow_blank: true }

  attr_accessor :person_state, :bill_state

  after_create :add_signature_of_creating_user
  after_create :copy_coordinates_from_user

  auto_html_for [:body, :media_file_url] do
    html_escape
    hashtag
    image(width: 425)
    dailymotion(width: 400, height: 250, autoplay: true)
    vimeo(width: 400, height: 250, autoplay: true)
    youtube(width: 400, height: 250, autoplay: true)
    link
    simple_format
  end

  # @return [Metadatum] the jurisdiction in which the question is asked
  def metadatum
    Metadatum.find_by_abbreviation(state)
  end

  # @todo delete if unnecessary with only 1 db
  # i.e. does belongs_to now work
  # @return [Person] the person to whom the question is addressed
  def person
    Person.find(person_id)
  end

  # @todo delete if unnecessary with only 1 db
  # i.e. does belongs_to now work
  # and delegation of state and person_state to Person
  # @param [Person] person a person
  def person=(person)
    if person
      self.person_id = person.id
      self.person_state = person['state']
      self.state ||= person['state']
    else
      self.person_id = nil
    end
  end

  def answered?
    answers.any?
  end

  # @todo delete if unnecessary with only 1 db
  # i.e. does belongs_to now work
  # @return [Bill] the bill the question is about
  def bill
    Bill.find(bill_id)
  end

  # @todo delete if unnecessary with only 1 db
  # i.e. does belongs_to now work
  # and delegation of state and person_state to Person
  # @param [Bill] bill a bill
  def bill=(bill)
    if bill
      self.bill_id = bill.id
      self.bill_state = bill['state']
      self.state ||= bill['state']
    else
      self.bill_id = nil
    end
  end

  private
  def add_signature_of_creating_user
    signatures.create!(user: user)
  end

  def state_must_be_included_in_the_list_of_states
    unless state.blank? || Metadatum.find_by_abbreviation(state)
      errors.add(:state, 'is not included in the list of states')
    end
  end

  def subject_must_be_included_in_the_list_of_subjects
    unless subject.blank? || Subject.all.include?(subject)
      errors.add(:subject, 'is not included in the list of subjects')
    end
  end

  def question_and_person_must_belong_to_the_same_jurisdiction
    unless person_state.blank? || person_state == state
      errors.add(:base, 'The question and the person must belong to the same state')
    end
  end

  def person_and_bill_must_belong_to_the_same_jurisdiction
    unless bill_state.blank? || bill_state == person_state
      errors.add(:base, 'The person and the bill must belong to the same state')
    end
  end

  def copy_coordinates_from_user
    QuestionCoordinatesWorker.perform_async(id.to_s)
  end
end
