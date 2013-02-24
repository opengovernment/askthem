# Billy
class Committee
  include Mongoid::Document

  # @note Field in common with Popolo.
  def name
    read_attribute(:subcommittee) || read_attribute(:committee)
  end

  # Returns the bills referred to this committee.
  def bills
    Bill.where('actions.related_entities.id' => id)
  end
end
