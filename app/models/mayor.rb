class Mayor < Person
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    city = location.city
    return where(id: []) unless city

    # handle special case where mayor is on county as well
    any_of({ state: JurisdictionId.new(state: location.state_code,
                                       municipality: city).id },
           { state: JurisdictionId.new(state: location.state_code,
                                       county: city).id })
  end
end
