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
  # The person.
  field :person_id, type: String
  # The person's extended biography.
  field :biography, type: String
  # The person's candidateId from ProjectVoteSmart.
  field :votesmart_id, type: String

  index(state: 1)
  index(person_id: 1)

  validates_presence_of :state, :person_id

  # @return [Metadatum] the jurisdiction in which the question is asked
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
