# add persistence and our local customizations
class CachedOfficial
  include Mongoid::Document

  # The person's jurisdiction in askthem
  belongs_to :metadatum, foreign_key: "state"
  belongs_to :person, index: true

  attr_accessor :office, :division

  before_validation :set_office_data, :set_division_data

  after_create :match_to_person

  field :name, type: String, as: :full_name
  field :party, type: String
  field :photoUrl, type: String
  field :channels, type: Array, default: []
  field :emails, type: Array, default: []
  field :addresses, type: Array, default: []
  field :phones, type: Array, default: []
  field :urls, type: Array, default: []

  field :office_name, type: String, as: :political_position_title
  field :office_level, type: String
  field :office_levels, type: Array, default: []
  field :office_roles, type: Array, default: []

  field :division_name, type: String, as: :most_recent_district
  field :division_scope, type: String
  field :ocd_division_id, type: String

  validates_presence_of [:name, :office_name, :office_level, :division_name,
                         :division_scope, :ocd_division_id]

  validates_uniqueness_of :name, scope: [:office_name, :office_level,
                                         :division_scope, :ocd_division_id]
  index(name: 1)
  index(state: 1)
  index(office_name: 1)
  index(office_level: 1)
  index(division_name: 1)
  index(division_scope: 1)
  index(ocd_division_id: 1)
  index({ name: 1, office_name: 1, office_level: 1, division_scope: 1,
          ocd_division_id: 1 }, { unique: true })

  def photo_url
    person_id.present? && person.image.present? ? person.image : photoUrl
  end

  def twitter_ids
    channels.select { |c| c["type"] == "Twitter" }.map { |t| t["id"] }
  end

  private
  def set_office_data
    return unless office.present?
    self.office_name = office["name"]
    self.office_level = office["level"]
    self.office_levels = Array(office["levels"])
    self.office_roles = Array(office["roles"])
  end

  def set_division_data
    return unless division.present?
    self.division_name = division["name"]
    self.division_scope = division["scope"]
    self.ocd_division_id = division["ocd_division_id"]
  end

  # with same email
  # with same twitter_id
  # same state, political_position, and rough match on name
  # @todo add necessary indexes on person
  def match_to_person
    if person_id.present?
      add_attributes_to(person)
      return person
    end

    # are we dealing with a jurisdiction that has no people yet?
    return copy_to_new_person unless Person.connected_to(state).count > 0

    possible_matches = find_possible_matches
    if possible_matches.count > 0
      possible_matches.each do |possible_match|
        if political_position == possible_match.political_position &&
            name_probably_matches(possible_match.full_name)

          update_attributes! person: possible_match
          add_attributes_to(possible_match)
          # default to first match, most cases there will only be one anyway
          return person
        end
      end
    else
      copy_to_new_person
    end
  end

  def find_possible_matches
    base_criteria = Person.where(state: state, "_type" => type).active

    possible_matches = if emails.to_a.any?
                         email_variations = emails + emails.map(&:downcase).uniq
                         base_criteria.in(email: email_variations)
                       else
                         []
                       end

    if possible_matches.empty? && twitter_ids.any?
      twitter_id_variations = twitter_ids + twitter_ids.map(&:downcase).uniq
      possible_matches = base_criteria.any_in(twitter_id: twitter_id_variations)
    end

    # try widdling things down by name
    if possible_matches.empty?
      query = comparable_parts_of(name).inject([]) do |query, part|
        query << { full_name: /#{part}/i }
      end

      possible_matches = base_criteria.any_of(query)
    end

    possible_matches
  end

  def comparable_parts_of(name)
    name.split(" ").select do |part|
      part.size > 1 && !part.include?("\.") &&
        !["jr", "sr"].include?(part.downcase)
    end
  end

  # check against name parts
  # @todo create process for comparing names if not complete match
  # @warn only handling exact match for now
  def name_probably_matches(person_name)
    comparable_parts_of(name) == comparable_parts_of(person_name)
  end

  # check match.political_position == office_level/division_scope (fuzzily, value class?)
  # will also need to rely on _type, as state, political_position are same for state & fed legislators
  # differentiator is _type
  # office_level: city division_scope: cityWide - mayor, other city officials
  # office_level: city division_scope: cityCouncil - councilmembers
  # office_level: county division_scope: countyWide - county officials, county mayor, & councilors
  # office_level: state division_scope: statewide - governor, other state officials
  # office_level: state division_scope: stateUpper - state senators
  # office_level: state division_scope: stateLower - state representatives
  # office_level: federal division_scope: statewide - senators
  # office_level: federal division_scope: congressional district - congresspeople
  # office_level: federal division_scope: national - national officials, pres, vice pres
  # probably need special case for mayor, who may be councilmember
  def type
    @type ||=
      case office_level
      when "city", "other"
        case division_scope.downcase
        when "citycouncil"
          "Councilmember"
        when "citywide", "ward"
          if office_name == "Mayor"
            "Mayor"
          elsif office_name =~ /council/i || office_name =~ /board/i
            "Councilmember"
          else
            "MunicipalOfficial"
          end
        else
          raise "Unknown office_level and division_scope combination"
        end
      when "county"
        if office_name == "Mayor"
          "Mayor"
        elsif office_name =~ /council/i
          "Councilmember"
        else
          "CountyOfficial"
        end
      when "state"
        case division_scope.downcase
        when "stateupper", "statelower"
          "StateLegislator"
        when "statewide"
          if office_name == "Governor"
            "Governor"
          else
            "StateOfficial"
          end
        end
      when "federal"
        case division_scope.downcase
        when "statewide", "congressional", "district congressional", "congressional district"
          "FederalLegislator"
        when "national"
          if ["President", ].include?(office_name)
            office_name.sub(" ", "") # handles Vice President
          else
            "FederalOfficial"
          end
        end
      end
  end

  def political_position
    case type
    when "FederalLegislator"
      # senators
      # but handle some smaller states that only have 1 rep
      if division_scope == "statewide" && !office_name.include?("House")
        "upper"
      else
        "lower"
      end
    when "StateLegislator"
      division_scope.sub("state", "").downcase
    when "Councilmember"
      "upper"
    else
      type.downcase.gsub(" ", "_")
    end
  end

  def copy_to_new_person
    unless Metadatum.where(id: state).first
      copy_to_new_metadatum
    end

    emails_to_add = emails
    email = emails_to_add.delete(0)

    # @todo all channels, addresses, urls
    attributes = { active: true,
      full_name: full_name,
      state: state,
      twitter_id: twitter_ids.first,
      email: email,
      channels: channels,
      photo_url: photoUrl,
      party: party,
      political_position: political_position,
      political_position_title: office_name,
      ocd_division_id: ocd_division_id }

    # add extra attributes for reference if relevant
    if emails_to_add.any?
      attributes[:emails] = emails_to_add
    end

    attributes[:phones] = phones if phones.any?

    offices = addresses.inject([]) do |results, address|
      results << { "address" => address }
    end

    attributes[:offices] = offices

    if ["lower", "upper"].include?(political_position)
      attributes[:chamber] = political_position
    end

    self.person = type.constantize.create(attributes)
    save!

    urls.each do |url|
      person.person_detail.links.find_or_initialize_by(url: url)
    end
    person.person_detail.save if person.person_detail.changed?

    person
  end

  def copy_to_new_metadatum
    # could be municipality or county
    # cannot rely on division_name as it may be full of all kinds of stuff
    name_parts = state.split("-")
    state_code = name_parts.delete_at(0)

    is_county = false
    if name_parts.include?("county")
      name_parts.delete_at(0)
      is_county = true
    end

    name = name_parts.collect(&:capitalize).join(" ")
    legislature_name = is_county ? name : "#{name} City Council"

    attributes = { "abbreviation" => state,
      "chambers" => { "upper" => { "name" => "Council",
          "title" => "Councilmember" } },
      "legislature_name" => legislature_name,
      "name" => name,
      "terms" => placeholder_terms
    }

    Metadatum.create attributes
  end

  # @todo replace this with something that allows for a nil value
  # since we DO NOT know the right value
  # in other words our model/views should not rely on terms being present
  def placeholder_terms
    [{ "end_year" => 2016, "start_year" => 2012, "name" => "2012-2016",
       "sessions" => ["2013", "2012"], "placeholder_value" => true }]
  end

  # @todo copy new attributes to existing person
  def add_attributes_to(person)
    unless person.read_attribute(:ocd_division_id)
      person.write_attribute(:ocd_division_id, ocd_division_id)
    end

    if photo_url.present? && should_update_photo_url_for?(person)
      person.photo_url = photo_url
    end

    if emails.any?
      emails_to_add = emails.collect(&:downcase)

      if !person.email?
        email = emails_to_add.delete_at(0)
        person.email = email
      elsif emails_to_add.include?(person.email.downcase)
        emails_to_add.delete(person.email.downcase)
      end

      person.write_attribute(:emails, emails_to_add) if emails_to_add.any?
    end

    if channels.any?
      unless person.read_attribute(:channels)
        person.write_attribute(:channels, channels)
      end

      unless person.read_attribute(:twitter_id)
        person.write_attribute(:twitter_id, twitter_ids.first)
      end

      unless person.read_attribute(:facebook_id)
        facebook_ids = channels.select { |c| c["type"] == "Facebook" }
          .map { |fb| fb["id"] }

        person.write_attribute(:facebook_id, facebook_ids.first)
      end

      unless person.read_attribute(:youtube_id)
        youtube_ids = channels.select { |c| c["type"] == "YouTube" }
          .map { |yt| yt["id"] }

        person.write_attribute(:youtube_id, youtube_ids.first)
      end
    end

    person.write_attribute(:phones, phones) unless person.read_attribute(:phones)

    unless person.read_attribute(:offices)
      offices = addresses.inject([]) do |results, address|
        results << { "address" => address }
      end

      person.write_attribute(:offices, offices)
    end

    urls.each do |url|
      person.person_detail.links.find_or_initialize_by(url: url)
    end
    person.person_detail.save if person.person_detail.changed?
    person.save if person.changed?
  end

  def should_update_photo_url_for?(person)
    !person.image? || person.image.include?("ballotpedia")
  end
end
