class FederalLegislator < Person
  # override for the specific relevant api
  # def self.for_location(location)
  # end

  def attributes_from_congress_api(api_data)
    api_data.each do |key, value|
      case key
      when 'bioguide_id'
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
      when 'votesmart_id'
        next
      when 'party'
        write_attribute :party, party_from_api(value)
      when 'terms'
        roles_from_api(value)
      else
        write_attribute key.to_sym, value
      end
    end
  end

  private
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
    value == 'house' ? 'lower' : 'uppper'
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
