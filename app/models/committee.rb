# Billy
class Committee
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: 'state'

  # Returns the committee's name.
  #
  # @return [String] the committee's name
  # @note From Popolo.
  def name
    read_attribute(:subcommittee) || read_attribute(:committee)
  end

  # Returns the committee's members.
  #
  # @return [Array<Person>] the committee's members
  # @note We do this because the OpenStates database is inconsistent.
  def people
    ids = read_attribute(:members).map{|x| x['leg_id']}.compact
    if ids.empty?
      []
    else
      Person.use(read_attribute(:state)).where(_id: {'$in' => ids}).to_a
    end
  end
end
