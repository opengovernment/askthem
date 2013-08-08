# `Mongoid.override_session` overrides any persistence settings set by the model
# using the `store_in` method. Until the below pull request is merged, we need
# to use `with` calls everywhere.
#
# @see https://github.com/mongoid/mongoid/pull/2909
Mongoid::Document::ClassMethods.class_eval do
  # Scopes the collection to the jurisdiction.
  #
  # @param [String] abbreviation a jurisdiction's abbreviation
  def connected_to(abbreviation)
    where(state: abbreviation)
  end
end

if Rails.env.development?
  module Mongoid
    module Factory
      old_from_db = instance_method(:from_db)

      define_method(:from_db) do |klass, attributes=nil, criteria_instance_id=nil|
        attributes.delete('_type') if klass == Metadatum && attributes['_type'] == 'metadata'
        old_from_db.bind(self).call(klass, attributes, criteria_instance_id)
      end
    end
  end
end
