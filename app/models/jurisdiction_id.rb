class JurisdictionId
  attr_accessor :state, :municipality, :county

  def initialize(options)
    @state = options[:state]
    @municipality = options[:municipality]
    @county = options[:county]
  end

  def id
    raise "Must specify state" unless state
    raise "Only municipality or county, not both" if municipality && county

    id = state.downcase
    id += "-#{for_id(municipality)}" if municipality
    id += "-county-#{for_id(county)}" if county
    id
  end

  private
  def for_id(name)
    name.downcase.gsub(" ", "-").gsub("_", "-")
  end
end
