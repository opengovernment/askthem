class DefaultSignatureThreshold
  DEFAULT_VALUES = { unspecified_person: 15,
    unaffiliated: 100,
    candidate: 15,
    federal: { upper: 500, lower: 350 },
    major_city_council: 25,
    state: 100,
    governor: 500 }

  def initialize(person)
    @person = person if person
  end

  def value
    return DEFAULT_VALUES[:unspecified_person] unless @person

    # @todo replace with more sophisticated calculation
    case @person.class.name
    when "Councilmember"
      DEFAULT_VALUES[:major_city_council]
    when "FederalLegislator"
      DEFAULT_VALUES[:federal][@person.chamber.to_sym]
    when "Governor"
      DEFAULT_VALUES[:governor]
    when "Candidate"
      DEFAULT_VALUES[:candidate]
    when "Person"
      DEFAULT_VALUES[:unaffiliated]
    else
      DEFAULT_VALUES[:unspecified_person]
    end
  end
end
