class Mayor < Person
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    state = location.state_code.downcase
    # @todo better handle unicode
    city = location.city.downcase.gsub(" ", "-")
    where(state: "#{state}-#{city}")
  end
end
