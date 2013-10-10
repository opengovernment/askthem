# Billy
class Vote
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: "state"
  belongs_to :bill

  index("yes_votes.leg_id" => 1)
  index("no_votes.leg_id" => 1)
  index("other_votes.leg_id" => 1)

  # Returns the people who voted.
  #
  # @return [Array<Person>] the people who voted
  # @note We do this because the OpenStates database is inconsistent.
  def people
    ids = []
    %w(yes no other).each do |type|
      ids += read_attribute("#{type}_votes").map { |x| x["leg_id"] }.compact
    end
    if ids.empty?
      []
    else
      Person.where(_id: { "$in" => ids }).to_a
    end
  end

  # Returns whether the vote has passed or failed
  #
  # @return [Boolean] the "passed" attribute value
  def passed?
    passed
  end

  # Whether and what the vote was for a given person
  #
  # @return [String] yes, no, other, or nil
  # returns first matching vote, as they should be unique
  def value_voted_by(person)
    %w(yes no other).each do |type|
      voters = read_attribute("#{type}_votes").map { |x| x["leg_id"] }.compact
      return type if voters.include?(person.id)
    end
    nil
  end
end
