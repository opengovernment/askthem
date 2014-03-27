class President < Person
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    where(state: JurisdictionId.new(state: location.country_code).id)
  end
end
