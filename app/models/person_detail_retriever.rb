class PersonDetailRetriever
  attr_accessor :person, :person_detail, :officials

  def initialize(person, options = {})
    @person = person
    @officials = options[:officials]
  end

  # add details for our person from secondary apis
  def retrieve!
    self.person_detail = person.person_detail
    update_from_usa_elected_required_apis if is_usa_elected_official?
    person_detail.save!
  end

  private
  # assumes if state specifies jurisdiction that is within us
  # is an elected official
  def is_usa_elected_official?
    return false unless person.state.present?

    return true if Metadatum::Us::ABBREVIATION == person.state
    return true if OpenGovernment::STATES.values.include?(person.state)

    state_prefix = person.state.split("-").first
    return true if OpenGovernment::STATES.values.include?(state_prefix)

    false
  end

  def update_from_usa_elected_required_apis
    self.person_detail = InfluenceExplorerPersonDetail.new(person).person_detail

    pvs = ProjectVoteSmartPersonDetail.new(person,
                                           person_detail: person_detail,
                                           officials: officials)
    self.person_detail = pvs.person_detail
  end
end
