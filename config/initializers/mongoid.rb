# `Mongoid.override_session` overrides any persistence settings set by the model
# using the `store_in` method. Until the below pull request is merged, we need
# to use `with` calls everywhere.
#
# @see https://github.com/mongoid/mongoid/pull/2909
Mongoid::Document::ClassMethods.class_eval do
  # Sets the appropriate MongoDB session to access a jurisdiction's data.
  #
  # @param [String] abbreviation a jurisdiction's abbreviation
  def use(abbreviation)
    if abbreviation && abbreviation[/\A[a-z]{2}\z/]
      with(session: 'openstates')
    else
      self
    end
  end

  # Scopes the collection to the jurisdiction.
  #
  # @param [String] abbreviation a jurisdiction's abbreviation
  def in(abbreviation)
    use(abbreviation).where(state: abbreviation)
  end
end
