# Exists only because we blow away the `people` collection regularly.
# @note Based on Popolo.
class DefaultSignatureThreshold
  DEFAULT_VALUES = { unspecified_person: 500,
    federal: 5000,
    major_city_council: 25,
    state: 100 }

  def initialize(person)
    @person = person if person
  end

  def value
    return DEFAULT_VALUES[:unspecified_person] unless @person

    # @todo replace with more sophisticated calculation
    case @person.class
    when Person
      # HACK for council members
      # @todo replace with CouncilMember class when implemented
      if @person.state.include?('-')
        DEFAULT_VALUES[:major_city_council]
      else
        DEFAULT_VALUES[:state]
      end
    when FederalLegislator
      DEFAULT_VALUES[:federal]
    end
  end
end
