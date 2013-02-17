Popolo::Person.class_eval do
  store_in collection: 'legislators'

  embeds_many :links, class_name: 'Popolo::Link', store_as: :sources

  field :full_name, type: String, as: :name
  field :leg_id, type: String, as: :slug
  field :last_name, type: String, as: :family_name
  field :first_name, type: String, as: :given_name
  field :middle_name, type: String, as: :additional_name
  field '+title', type: String, as: :honorific_prefix
  field :suffixes, type: String, as: :honorific_suffix
  field '+gender', type: String, as: :gender
  field :photo_url, type: String, as: :image

  index Popolo::Billy.level_field => 1, chamber: 1, district: 1
  index Popolo::Billy.level_field => 1, 'roles.type' => 1, 'roles.chamber' => 1
  index party: 1

  # XXX Committee memberships.
  def memberships
    @memberships ||= begin
      memberships = []
      if read_attribute(:party)
        memberships << Membership.new({
          organization: Popolo::Organization.find_by(name: read_attribute(:party)),
          person: self,
        })
      end
      Mongoid::Relations::Referenced::Many.new(self, memberships, self.class.relations['memberships'])
    end
  end

  def posts
    @posts ||= begin
      posts = []

      if read_attribute(:district)
        parent_organization = Popolo::Organization.find_by_slug(read_attribute(Popolo::Billy.level_field))
        organization = Popolo::Organization.find_by_slug(read_attribute(:chamber), parent_id: parent_organization)

        area = Popolo::Area.find_by({
          parent_id: Popolo::Area.find_by_slug(read_attribute(Popolo::Billy.level_field)),
          classification: read_attribute(:chamber),
          name: read_attribute(:district),
        })

        position = Popolo::Person.where({
          Popolo::Billy.level_field => read_attribute(Popolo::Billy.level_field),
          chamber: read_attribute(:chamber),
          district: read_attribute(:district),
        }).asc(:_id).index{|person| person.id == id}

        posts << Popolo::Post.find_by(organization: organization, area: area, position: position)
      end

      # @todo This code assumes that the names of non-legislative posts are unique
      #   within organizations, e.g. "Majority Whip".
      read_attribute(:roles).each do |role|
        unless role.key?('district') || role.key?('committee')
          parent_organization = Popolo::Organization.find_by_slug(role[Popolo::Billy.level_field])
          organization = if role['chamber'].present?
            Popolo::Organization.find_by_slug(role['chamber'], parent_id: parent_organization)
          else
            parent_organization
          end
          posts << Popolo::Post.find_by(organization: organization, role: role['type'])
        end
      end

      Mongoid::Relations::Referenced::Many.new(self, posts, self.class.relations['posts'])
    end
  end
end
