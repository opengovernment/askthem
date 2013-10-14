# Exists only because we blow away the `people` collection regularly.
# @note Based on Popolo.
class DefaultSignatureThreshold
  DEFAULT_VALUES = { unspecified_person: 500,
    federal: 5000,
    major_city_council: 25,
    state: 100,
    governor: 200 }

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
      DEFAULT_VALUES[:federal]
    when "Governor"
      DEFAULT_VALUES[:governor]
    else
      # this covers StateLegislator as default
      DEFAULT_VALUES[:state]
    end
  end
end
