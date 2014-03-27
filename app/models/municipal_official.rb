class MunicipalOfficial < Person
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    where(state: JurisdictionId.new(state: location.state_code,
                                    municipality: location.city).id)
  end
end
