require 'popolo'
require 'popolo/billy/engine'

require 'decorators'

module Popolo
  module Billy
    # @return [String] the Billy `LEVEL_FIELD`
    mattr_accessor :level_field, instance_accessor: false
    @@level_field = 'jurisdiction'
  end
end

# Billy adds a `_type` field on legislator documents equal to `person`, but it
# should be equal to `popolo/person` to play well with Mongoid.
module Mongoid
  module Factory
    old_from_db = instance_method(:from_db)

    define_method(:from_db) do |klass, attributes=nil, criteria_instance_id=nil|
      attributes.delete('_type') if klass == Popolo::Person && attributes['_type'] == 'person'
      old_from_db.bind(self).call(klass, attributes, criteria_instance_id)
    end
  end
end
