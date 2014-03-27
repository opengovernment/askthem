class StateOfficial < Person
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    where(state: JurisdictionId.new(state: location.state_code).id)
  end
end
