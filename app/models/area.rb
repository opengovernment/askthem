# Billy
class Area
  include Mongoid::Document
  store_in collection: 'districts'

  field :name, type: String
end
