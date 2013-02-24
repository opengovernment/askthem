# Billy
class Bill
  include Mongoid::Document

  # For querying bills related to a committee.
  index('actions.related_entities.id' => 1)

  def questions # @todo
    []
  end

  def answers # @todo
    []
  end
end
