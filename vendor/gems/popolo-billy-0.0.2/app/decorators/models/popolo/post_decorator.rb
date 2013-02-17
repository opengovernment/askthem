Popolo::Post.class_eval do
  # In order to disambiguate posts with the same name.
  field :position, type: Integer

  index organization_id: 1, area_id: 1, position: 1
  index organization_id: 1, role: 1

  def person
    @person ||= begin
      if area
        Popolo::Person.where({
          Popolo::Billy.level_field => organization.parent.slug,
          chamber: organization.slug,
          district: area.name,
        }).asc(:_id).skip(position).limit(1).first
      # @todo This code assumes that the names of non-legislative posts are
      #   unique within organizations, e.g. "Majority Whip".
      elsif organization.classification == 'legislature'
        Popolo::Person.where({
          Popolo::Billy.level_field => organization.slug,
          # Querying 'roles.chamber' => nil would turn up zero results.
          'roles.type' => role,
        }).first
      else
        Popolo::Person.where({
          Popolo::Billy.level_field => organization.parent.slug,
          'roles.chamber' => organization.slug,
          'roles.type' => role,
        }).first
      end
    end
  end

  def addresses
    unless ENV['RAKE_RUNNING'] # prevent storing of addresses
      @addresses ||= begin
        if person
          offices = person.read_attribute(:offices) || []
          offices.map! do |office|
            Popolo::Address.new({
              type: office['type'],
              address: office['address'],
              voice: office['phone'],
              fax: office['fax'],
            })
          end
          Mongoid::Relations::Embedded::Many.new(self, offices, self.class.embedded_relations['addresses'])
        end
      end
    end
  end
end
