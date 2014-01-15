class UnaffiliatedPersonTidyWorker
  include Sidekiq::Worker

  # tidy up unaffiliated people that don't have questions
  # meant to be scheduled at a given period after they are created
  def perform(id)
    person = Person.find(id)
    return if person.questions.any? ||
      person.state != Metadatum::Unaffiliated::ABBREVIATION

    person.person_detail.destroy
    person.destroy
  end
end
