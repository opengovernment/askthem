# Billy
class Metadatum
  include Mongoid::Document

  has_many :bills, foreign_key: 'state'
  has_many :committees, foreign_key: 'state'
  has_many :people, foreign_key: 'state'
  has_many :questions, foreign_key: 'state'
  has_many :votes, foreign_key: 'state'

  def self.find_by_abbreviation(abbreviation)
    where(abbreviation: abbreviation).first
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
    read_attribute(:chambers)[chamber].try{|chamber| chamber['title']}
  end

  # Returns the current session's identifier.
  #
  # @return [String] the current session's identifier
  def current_session
    read_attribute(:terms).last['sessions'].last
  end

  # Returns whether the jurisdiction assigns subjects to bills.
  #
  # @return [Boolean] whether the jurisdiction assigns subjects to bills
  # @note A jurisdiction can include "subjects" in its feature flags, without
  #   setting any subjects on any bills.
  def subjects?
    !!Bill.where(state: self.id, subjects: {'$nin' => [[], nil]}).first
  end
end
