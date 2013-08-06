# Exists only because we blow away the `people` collection regularly.
# @note Based on Popolo.
class PersonDetail
  include Mongoid::Document
  store_in session: 'default' # @see https://github.com/mongoid/mongoid/pull/2909

  # Links to pages about this person, e.g. Wikipedia, or to accounts this
  # person has on other websites, e.g. Twitter.
  embeds_many :links

  # The person's jurisdiction.
  field :state, type: String
  field :person_id, type: String
  field :biography, type: String
  # The person's candidateId from Project VoteSmart.
  field :votesmart_id, type: String
  # how many signatures does a question need to reach before we deliver it?
  field :signature_threshold, type: Integer, default: -> do
    for_person = nil
    for_person = person if person_id && Person.in(state).where(id: person_id).count
    DefaultSignatureThreshold.new(for_person).value
  end

  index(state: 1)
  index(person_id: 1)
  index(votesmart_id: 1)

  validates_presence_of :state, :person_id

  # @return [Metadatum] the jurisdiction in which the person belongs
  def metadatum
    Metadatum.find_by_abbreviation(state)
  end

  # @return [Person] the person
  def person
    Person.use(state).find(person_id)
  end

  # @param [Person] person a person
  def person=(person)
    if person
      self.person_id = person.id
      self.state = person['state']
    else
      self.person_id = nil
    end
  end
end
