class CountyOfficial < Person
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: []) unless location

    # @todo DRY up state-city id construction (see mayor, etc.)
    state = location.state_code.downcase
    # @todo better handle unicode
    county = location.sub_state_code.downcase.gsub(" ", "-")
    where(state: "#{state}-county-#{county}")
  end
end
