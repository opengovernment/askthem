# Exists only because we blow away the `people` collection regularly.
# @note Based on Popolo.
class PersonDetail
  include Mongoid::Document
  store_in session: 'default' # @see https://github.com/mongoid/mongoid/pull/2909

  # Links to pages about this person, e.g. Wikipedia, or to accounts this
  # person has on other websites, e.g. Twitter.
  embeds_many :links

  # The person'd ID.
  field :person_id
  # The person's jurisdiction.
  field :state
  # The person's extended biography.
  field :biography
  # The person's candidateId from ProjectVoteSmart.
  field :votesmart_id

  index(person_id: 1)

  def person
    Person.use(state).find(person_id)
  end

  def person=(person)
    self.person_id = person.id
    self.state = person['state']
  end
end
