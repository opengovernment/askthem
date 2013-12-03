class CachedOfficialsFromGoogle
  include Enumerable

  attr_accessor :address, :response, :divisions, :cached_officials

  def initialize(address)
    self.address = address
    self.response = GoogleCivicInfo::Client.new(api_key: ENV['GOOGLE_API_KEY'])
      .lookup(address)
    self.divisions = response.divisions
    self.cached_officials = []
    compile_cached_officials
  end

  def each
    cached_officials.each { |cached_official| yield cached_official }
  end

  private
  def compile_cached_officials
    divisions.each do |division|
      division.offices.each do |office|
        office.officials.each do |official|
          unless skip_for_now(office, division)
            cached_officials << cached_official_from(official,
                                                     office,
                                                     division)
          end
        end
      end
    end
  end

  # skip president & vice president, county, city officials, state officials
  def skip_for_now(office, division)
    (office.level == "county") ||
      (office.level == "federal" && division.scope == "national") ||
      ((office.level == "city" || office.level == "other") &&
       division.scope.downcase == "citywide" &&
       (office.name.downcase != "mayor" &&
        !office.name.downcase.include?("council"))) ||
      (office.level == "state" && division.scope.downcase == "statewide" &&
       office.name.downcase != "governor")
  end

  def cached_official_from(official, office, division)
    cached_official = CachedOfficial.new(data_from(official))
    cached_official.office = data_from(office)
    cached_official.division = data_from(division)
    cached_official.state = jurisdiction_from(response, division)

    begin
      cached_official.save!
    rescue Mongoid::Errors::Validations
      # likely already an existing cached_official
      cached_official = CachedOfficial.where(name: official.name,
                                             office_name: office.name,
                                             ocd_division_id: division.ocd_division_id).first
    end
    cached_official
  end

  # we strip out the nested object classes
  # in order to jam everything into mongodb
  def data_from(object)
    JSON(object.to_json).as_json
  end

  def jurisdiction_from(response, division)
    city = response.normalized_input["city"].downcase
    state = response.normalized_input["state"].downcase

    use_state_scopes = ["statewide", "congressional",
                        "congressional district", "district congressional",
                        "stateupper", "statelower"]

    case division.scope.downcase
    when *use_state_scopes
      state
    when "citywide", "citycouncil"
      "#{state}-#{city.gsub(" ", "-").gsub("_", "-")}"
    when "countywide"
      # HACK, shouldn't rely on internals of ocd_division_id structure
      # but relying on name means may include "County" at end
      county = division.ocd_division_id.split("/").last.split("county\:").last
      "#{state}-county-#{county.gsub("_", "-")}"
    when "national"
      Metadatum::Us::ABBREVIATION
    end
  end
end
