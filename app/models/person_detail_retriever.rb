class PersonDetailRetriever
  attr_accessor :person, :person_detail, :officials

  def initialize(person, options = {})
    @person = person
    @officials = options[:officials]
  end

  # add details for our person from secondary apis
  def retrieve!
    person_detail = InfluenceExplorerPersonDetail.new(person).person_detail
    pvs = ProjectVoteSmartPersonDetail.new(person,
                                           person_detail: person_detail,
                                           officials: officials)
    person_detail = pvs.person_detail
    person_detail.save!
  end
end
