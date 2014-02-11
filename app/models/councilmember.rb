require "legislator"

class Councilmember < Person
  include Legislator

  # this is a very naive implementation, only does city wide
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    city = location.city
    return where(id: []) unless city

    city_code = city.gsub(" ", "-").downcase
    abbreviation = "#{location.state_code.downcase}-#{city_code}"
    where(state: abbreviation)
  end
end
