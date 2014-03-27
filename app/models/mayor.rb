class Mayor < Person
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    city = location.city
    return where(id: []) unless city

    where(state: JurisdictionId.new(state: location.state_code,
                                    municipality: city).id)
  end
end
