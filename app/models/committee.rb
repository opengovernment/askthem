# Billy
class Committee
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: 'state'

  # @note Field in common with Popolo.
  def name
    read_attribute(:subcommittee) || read_attribute(:committee)
  end

  # Returns the committee's members.
  def people
    ids = read_attribute(:members).map{|x| x['leg_id']}.compact
    if ids.empty?
      []
    else
      Person.where(_id: {'$in' => ids}).to_a
    end
  end
end
