require "legislator"

class Councilmember < Person
  include Legislator

  # this is a very naive implementation, only does city or county wide
  # handle special case where councilmember is on county as well
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    city = location.city
    return where(id: []) unless city

    any_of({ state: JurisdictionId.new(state: location.state_code,
                                       municipality: city).id },
           { state: JurisdictionId.new(state: location.state_code,
                                       county: city).id })
  end
end
