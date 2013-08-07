# Billy
class Vote
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: 'state'
  belongs_to :bill

  # Returns the people who voted.
  #
  # @return [Array<Person>] the people who voted
  # @note We do this because the OpenStates database is inconsistent.
  def people
    ids = []
    %w(yes no other).each do |type|
      ids += read_attribute("#{type}_votes").map{|x| x['leg_id']}.compact
    end
    if ids.empty?
      []
    else
      Person.where(_id: {'$in' => ids}).to_a
    end
  end
end
