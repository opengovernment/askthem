class Mayor < Person
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    city = location.city
    return where(id: []) unless city

    state = location.state_code.downcase

    # @todo better handle unicode
    city = city.downcase.gsub(" ", "-")
    where(state: "#{state}-#{city}")
  end
end
