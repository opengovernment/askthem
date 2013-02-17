Popolo::Organization.class_eval do
  index name: 1

  # XXX Committee memberships.
  def memberships
    @memberships ||= begin
      # All non-legislative people are expected to hold posts in legislatures.
      # All members of a chamber hold posts in that chamber.
      memberships = []
      if classification == 'party'
        memberships += Popolo::Person.where(party: name).map do |person|
          Popolo::Membership.new({
            organization: self,
            person: person,
          })
        end
      end
      Mongoid::Relations::Referenced::Many.new(self, memberships, self.class.relations['memberships'])
    end
  end
end
