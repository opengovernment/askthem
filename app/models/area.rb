# Billy
class Area
  include Mongoid::Document
  store_in collection: 'districts'

  # @note Field in common with Popolo.
  field :name, type: String
end
