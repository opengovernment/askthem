# Billy
class Metadatum
  include Mongoid::Document

  # OpenStates
  has_many :bills, foreign_key: 'state'
  has_many :committees, foreign_key: 'state'
  has_many :people, foreign_key: 'state'
  has_many :votes, foreign_key: 'state'

  # OpenGoverment
  has_many :person_details, foreign_key: 'state'
  has_many :questions, foreign_key: 'state'

  field :_id, type: String, default: -> {abbreviation}
  field :abbreviation, type: String

  def self.find_by_abbreviation(abbreviation)
    self.find(abbreviation)
  end

  # Returns whether the jurisdiction has a lower chamber.
  #
  # @return [Boolean] whether the jurisdiction has a lower chamber
  def lower_chamber?
    read_attribute(:chambers).key?('lower')
  end

  # Returns whether the jurisdiction has an upper chamber.
  #
  # @return [Boolean] whether the jurisdiction has an upper chamber
  def upper_chamber?
    read_attribute(:chambers).key?('upper')
  end

  # Returns the brief name of the chamber.
  #
  # @param [String] chamber "lower" or "upper"
  # @return [String] the brief name of the chamber
  def chamber_name(chamber)
    read_attribute(:chambers)[chamber].try{|chamber| chamber['name']} || chamber
  end

  # Returns the title for members of the chamber.
  #
  # @param [String] chamber "lower" or "upper"
  # @return [String] the title for members of the chamber
  def chamber_title(chamber)
    unless chamber.nil?
      read_attribute(:chambers)[chamber].try{|chamber| chamber['title']}
    end
  end

  # Returns the current session's identifier.
  #
  # @return [String] the current session's identifier
  def current_session
    read_attribute(:terms).last['sessions'].last
  end

  # Returns the most recent regular session's identifier.
  #
  # @return [String] the most recent regular session's identifier
  def current_regular_session
    most_recent_session('primary')
  end

  # Returns the most recent special session's identifier.
  #
  # @return [String] the most recent special session's identifier
  def current_special_session
    most_recent_session('special')
  end

  # Returns whether the jurisdiction assigns subjects to bills.
  #
  # @return [Boolean] whether the jurisdiction assigns subjects to bills
  # @note A jurisdiction can include "subjects" in its feature flags, without
  #   setting any subjects on any bills.
  def subjects?
    # The following code is slow. Worse, it resets the persistence options of
    # all unevaluated queries. We instead cache a list of states with subjects.
    #
    #     !!Bill.where(state: self.id, subjects: {'$nin' => [[], nil]}).first
    #
    # Run the following code to get a fresh list of states with subjects:
    #
    #     a = []; db.metadata.distinct('_id').forEach(function (x) {if (db.bills.findOne({state: x, subjects: {$nin: [[], null]}})) a.push(x)})
    %w(ak al ca hi ia id in ky la md me mi mn mo ms mt nc nd nj nm nv ny ok or ri sc sd tn tx ut va wa wi).include?(abbreviation)
  end

private

  def most_recent_session(type)
    session_details = read_attribute(:session_details)
    read_attribute(:terms).last['sessions'].reverse.each do |session|
      # OpenStates doesn't always declare the session type.
      return session if session_details[session].key?('type') && session_details[session]['type'] == type ||
        type == 'primary' && !session_details[session]['display_name'][/Budget|Called|Extraordinary|Fiscal|Special/] ||
        type == 'special' &&  session_details[session]['display_name'][/Budget|Called|Extraordinary|Fiscal|Special/]
    end
    nil # don't return the enumerator
  end
end
