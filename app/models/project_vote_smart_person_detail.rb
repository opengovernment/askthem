# -*- coding: utf-8 -*-
require 'project_vote_smart'

class ProjectVoteSmartPersonDetail
  attr_accessor :person, :person_detail, :officials

  def initialize(person, options = {})
    @person = person
    @person_detail = options[:person_detail] || person.person_detail

    return person_detail if person_detail.votesmart_id.present? ||
      person_detail.person.votesmart_id.present?

    @officials = options[:officials]
    @person_detail.votesmart_id = votesmart_id
  end

  def officials
    @officials ||= get_officials(person.state, person.political_position)
  end

  def votesmart_id
    votesmart_id = person.votesmart_id || person_detail.votesmart_id
    return votesmart_id if votesmart_id

    officials.each do |official|
      return official['candidateId'] if person_match_official?(person, official)
    end
    votesmart_id
  end

  private
  def get_officials(state, political_position)
    api = ProjectVoteSmart.new
    office_ids = api.office_ids(state: state, political_position: political_position)
    api.officials_by_state_and_office(state, office_ids)
  end

  def person_match_official?(person, official)
    return false unless district_or_office_for(person) ==
      pvs_district_or_office_for(official)

    return false unless NameComparison.new(comparable_family_name_for(person),
                                           official['lastName']).same?

    # only apply absolute match of first/nickname if federal
    if person.state == 'us'
      unless NameComparison.new(person.first_name, official['firstName']).same?
        return false if official['nickName'].blank? ||
          !NameComparison.new(person.first_name, official['nickName']).same?
      end
    end

    true
  end

  def pvs_district_or_office_for(official)
    # @todo move 7, 8, 9 to constant on ProjectVoteSmart
    if [7, 8, 9].include?(official['officeId'].to_i)
      official['officeDistrictName']
    else
      official['officeName']
    end
  end

  def district_or_office_for(person)
    district_or_office = person['district']

    # reset if federal
    if person.state == 'us'
      district_or_office = person.political_position == 'lower' ? 'U.S. House' : 'U.S. Senate'
    end

    # handle governors, etc.
    unless district_or_office
      district_or_office = person.political_position_title
    end

    district_or_office
  end

  # OpenStates may have names like "Jim Anderson (SD28)", where the
  # family name is incorrectly set to "(SD28)". It may also fail to
  # identify suffixes, incorrectly leaving them in the family name.
  def comparable_family_name_for(person)
    last_name = person.family_name || person.full_name.split(' ').last
    first_names = person.given_name || person.full_name.delete(last_name)
    if last_name[/\A\([A-Z0-9]+\)\z/]
      first_names[/(\S+)\z/]
    else
      last_name
    end.sub(/,? (?:III|IV|Jr\.|M\.D\.|SR|Sr\.)\z/, '')
  end

  class NameComparison
    def initialize(supplied_name, pvs_name)
      @supplied_name = ComparableName.new(supplied_name)
      @pvs_name = ComparableName.new(pvs_name)
    end

    def same?
      # OpenStates and Project VoteSmart may have more or fewer family
      # names, e.g. "Navarro" versus "Navarro-Ratzlaff", "Turner" versus
      # "Turner Lairy" or "Oakes" versus "Erwin Oakes".
      a = [@supplied_name, @supplied_name[/\S+\z/]].compact
        .uniq.map(&:fingerprint)

      b = [@pvs_name,
           @pvs_name[/\A\p{L}+/],
           @pvs_name[/\p{L}+\z/]].compact.uniq.map(&:fingerprint)

      (a & b).present?
    end

    private
    class ComparableName < String
      # Remove all diacritics, spaces, punctuation and control characters.
      def fingerprint
        gsub(/`|\p{Punct}|\p{Cntrl}|[[:space:]]/, '')
          .tr(
              "ÀÁÂÃÄÅàáâãäåĀāĂăĄąÇçĆćĈĉĊċČčÐðĎďĐđÈÉÊËèéêëĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħÌÍÎÏìíîïĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłÑñŃńŅņŇňŉŊŋÒÓÔÕÖØòóôõöøŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšſŢţŤťŦŧÙÚÛÜùúûüŨũŪūŬŭŮůŰűŲųŴŵÝýÿŶŷŸŹźŻżŽž",
              "AAAAAAaaaaaaAaAaAaCcCcCcCcCcDdDdDdEEEEeeeeEeEeEeEeEeGgGgGgGgHhHhIIIIiiiiIiIiIiIiIiJjKkkLlLlLlLlLlNnNnNnNnnNnOOOOOOooooooOoOoOoRrRrRrSsSsSsSssTtTtTtUUUUuuuuUuUuUuUuUuUuWwYyyYyYZzZzZz"
              )
          .downcase
      end
    end
  end
end
