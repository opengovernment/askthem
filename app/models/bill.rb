# Billy
class Bill
  include Mongoid::Document

  index('actions.related_entities.id' => 1)

  def questions # @todo
    []
  end

  def answers # @todo
    []
  end
end
