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
    return legacy_skip_for_now(office, division) if office.level.present?

    return false if do_not_skip_based_on_office_hack?(office)

    office.is_federal_executive_or_judicial? ||
      (!office.is_governor? && !office.is_mayor? &&
       !office.is_councilmember? && !office.is_state_legislator? &&
       !office.is_federal_legislator?)
  end

  # mayor, governor, councilmembers should not be skipped
  # the data for office.levels & office.roles is extremely spotty
  # HACK to detect them
  def do_not_skip_based_on_office_hack?(office)
    office.levels.blank? &&
      (office.name.downcase == "mayor" ||
       office.name.downcase == "governor" ||
       office.name.downcase.include?("council") ||
       office.name.downcase.include?("alder") ||
       office.name.downcase.include?("house") ||
       office.name.downcase.include?("senate"))
  end

  def legacy_skip_for_now(office, division)
    (office.level == "county" && (office.name.downcase != "mayor" &&
                                  !office.name.downcase.include?("council"))) ||
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
    cached_official.state = jurisdiction_from(response, division, office)

    office.level = office.level || guess_office_level(office, division)
    cached_official.office = data_from(office)

    division.scope = division.scope || guess_division_scope(office, division)
    cached_official.division = data_from(division)

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

  def guess_office_level(office, division)
    if office.is_governor? || office.is_state_legislator?
      GoogleCivicInfo::Office::STATE
    elsif office.is_federal_legislator? || office.is_federal_executive_or_judicial?
      GoogleCivicInfo::Office::FEDERAL
    elsif division.is_county?
      GoogleCivicInfo::Office::COUNTY
    elsif office.is_mayor? || office.is_councilmember?
      GoogleCivicInfo::Office::CITY
    else
      GoogleCivicInfo::Office::OTHER
    end
  end

  # HACK: this is incomplete and ugly, but will work for our purposes
  # v2 data is not reliable enough for us not to use a HACK
  def guess_division_scope(office, division)
    if office.is_governor? ||
        (office.is_federal_legislator? &&
         office.roles.include?("legislatorUpperBody"))
      GoogleCivicInfo::Division::STATEWIDE
    elsif office.is_federal_legislator? # only congress shoule make it here
      GoogleCivicInfo::Division::CONGRESSIONAL
    elsif office.is_federal_executive_or_judicial?
      GoogleCivicInfo::Division::NATIONAL
    elsif office.is_state_legislator?
      if office.is_state_senator?
        GoogleCivicInfo::Division::STATE_UPPER
      else
        GoogleCivicInfo::Division::STATE_LOWER
      end
    elsif division.is_county?
      GoogleCivicInfo::Division::COUNTYWIDE
    elsif office.is_mayor?
      GoogleCivicInfo::Division::CITY_WIDE
    elsif office.is_councilmember?
      GoogleCivicInfo::Division::CITY_COUNCIL
    else
      Rails.info("what is unfindable division scope: #{office.inspect}")
    end
  end

  # we strip out the nested object classes
  # in order to jam everything into mongodb
  def data_from(object)
    JSON(object.to_json).as_json
  end

  def jurisdiction_from(response, division, office)
    JurisdictionParser.new(response, division, office).jurisdiction
  end

  class JurisdictionParser
    attr_accessor :response, :division, :office, :city, :state

    def initialize(response, division, office)
      self.response = response
      self.division = division
      self.office = office
      self.city = response.normalized_input["city"].downcase
      self.state = response.normalized_input["state"].downcase
    end

    def jurisdiction
      return jurisdiction_from_scope if legacy?

      jurisdiction = state
      if division.is_county?
        jurisdiction = county_jurisdiction_id
      elsif office.is_mayor? || office.is_councilmember?
        jurisdiction = JurisdictionId.new(state: state, municipality: city).id
      elsif office.levels.present? && office.levels.include?("country")
        jurisdiction = Metadatum::Us::ABBREVIATION
      end

      jurisdiction
    end

    private
    def legacy?
      office.level.present? && division.scope.present?
    end

    def county_jurisdiction_id
      # HACK, shouldn't rely on internals of ocd_division_id structure
      # but relying on name means may include "County" at end
      # also cannot rely on office to have correct levels set in v2
      county = division.ocd_division_id.split("/").last.split("county\:").last
      JurisdictionId.new(state: state, county: county).id
    end

    def jurisdiction_from_scope
      use_state_scopes = ["statewide", "congressional",
                          "congressional district", "district congressional",
                          "stateupper", "statelower"]

      case division.scope.downcase
      when *use_state_scopes
        state
      when "citywide", "citycouncil", "ward"
        JurisdictionId.new(state: state, municipality: city).id
      when "countywide"
        county_jurisdiction_id
      when "national"
        Metadatum::Us::ABBREVIATION
      end
    end
  end
end
