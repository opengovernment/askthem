class FederalLegislator < Person
  field :represents_state, type: String

  def self.base_api_url
      'http://congress.api.sunlightfoundation.com'
  end

  def self.api_plural_type
      'legislators'
  end

  def attributes_from_congress_api(api_data)
    api_data.each do |key, value|
      case key
      when self.class.api_id_field
        self.id = value
        self.leg_id = value
      when 'chamber'
        write_attribute :chamber, chamber_from_api(value)
      when 'gender'
        self.gender = value == 'F' ? 'Female' : 'Male'
      when 'name_suffix'
        self.suffixes = value
      when 'state'
        self.state = 'us'
        self.represents_state = value.downcase
      when 'votesmart_id'
        write_attribute :votesmart_id, value.to_s
      when 'party'
        write_attribute :party, party_from_api(value)
      when 'terms'
        roles_from_api(value)
      else
        write_attribute key.to_sym, value
      end
    end
    self.write_attribute :full_name, compile_full_name
    self.write_attribute :active, true
  end

  private
  def compile_full_name
    nick_name = read_attribute('nick_name')
    full_name = nick_name || first_name
    full_name += " #{last_name}"
    full_name += " #{suffixes}" if suffixes && !nick_name
    full_name
  end

  def self.api_url_for_jurisdiction
    "#{base_api_url}/#{api_plural_type}"
  end

  def self.api_geo_url
    "#{api_url_for_jurisdiction}/locate"
  end

  def self.api_id_field
    'bioguide_id'
  end

  def self.api_format_abbreviation(abbreviation)
    abbreviation.upcase
  end

  def self.params_for_location(data)
    { latitude: data.latitude,
      longitude: data.longitude,
      apikey: api_key }
  end

  def self.api_parse(data)
    JSON.parse(data)['results']
  end

  def self.build_from_api(attributes)
    federal_legislator = with(session: 'openstates').new
    federal_legislator.attributes_from_congress_api attributes
    federal_legislator
  end

  def roles_from_api(terms)
    write_attribute(:roles, []) unless read_attribute(:roles)

    terms.each do |term|
      role = { term_years: [] }
      term.each do |key, value|
        case key
        when 'start'
          role[:start_date] = value
          role[:term_years].insert 0, Time.parse(value).year
        when 'end'
          role[:end_date] = value
          role[:term_years].push Time.parse(value).year
        when 'party'
          role[:party] = party_from_api(value)
        when 'state'
          role[:state] = 'us'
        when 'chamber'
          role[:chamber] = chamber_from_api(value)
        else
          role[key.to_sym] = value
        end
      end

      role[:term] = role[:term_years].join('-')
      role.delete :term_years
      role = role.with_indifferent_access

      today = Date.today
      if today >= Date.parse(role[:start_date]) &&
          today <= Date.parse(role[:end_date])
        self.roles << role
      else
        write_attribute(:old_roles, []) unless read_attribute(:old_roles)
        self.old_roles << role
      end
    end
  end

  def chamber_from_api(value)
    value == 'house' ? 'lower' : 'upper'
  end

  def party_from_api(value)
    case value
    when 'D'
      'Democratic'
    when 'R'
      'Republican'
    when 'I'
      'Independent'
    else
      value
    end
  end
end
