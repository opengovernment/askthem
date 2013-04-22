# @todo Remove after switching to OpenStates API and JSON downloads.
module Mongoid
  module Factory
    old_from_db = instance_method(:from_db)

    define_method(:from_db) do |klass, attributes=nil, criteria_instance_id=nil|
      attributes.delete('_type') if klass == Metadatum && attributes['_type'] == 'metadata'
      old_from_db.bind(self).call(klass, attributes, criteria_instance_id)
    end
  end
end
