# Billy
class Committee
  include Mongoid::Document

  def name
    read_attribute(:subcommittee) || read_attribute(:committee)
  end

  def bills
    Bill.where('actions.related_entities.id' => id)
  end
end
