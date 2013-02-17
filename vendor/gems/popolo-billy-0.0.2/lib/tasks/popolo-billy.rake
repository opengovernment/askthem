namespace :popolo do
  namespace :billy do
    require 'chronic'

    # @see https://github.com/mojombo/chronic/pull/172
    # @see https://github.com/mojombo/chronic/issues/151
    # @todo Can remove all but "second" with next release after 0.9.0.
    value = Chronic::Numerizer.send(:remove_const, 'ORDINALS')
    value += [
      ['second', '2'],
      ['twelfth', '12'],
      ['twentieth', '20'],
      ['thirtieth', '30'],
      ['fourtieth', '40'],
      ['fiftieth', '50'],
      ['sixtieth', '60'],
      ['seventieth', '70'],
      ['eightieth', '80'],
      ['ninetieth', '90'],
    ]
    Chronic::Numerizer.const_set('ORDINALS', value)

    # Otherwise, "Tennessee" becomes "10nessee".
    value = Chronic::Numerizer.send(:remove_const, 'DIRECT_NUMS')
    value.each do |v|
      v[0] = 'ten(\W|$)' if v[0] == 'ten'
    end
    Chronic::Numerizer.const_set('DIRECT_NUMS', value)

    # Returns the requested collection.
    #
    # @param [Symbol] collection a collection's name
    # @return [Moped::Collection] the collection
    def collection(collection)
      Mongoid.default_session[collection]
    end

    # Finds or creates a document and updates it. Prompts for confirmation
    # before creating a document.
    #
    # @param [Class] klass a class
    # @param [Hash] create_attributes attributes to set on create
    # @param [Hash] update_attributes attributes to set on update
    def find_or_create_by_with_prompt(klass, create_attributes, update_attributes = {})
      unless ENV['FORCE']
        puts "Create #{klass.model_name.human} with (#{create_attributes.inspect})? (y/n)"
      end
      if ENV['FORCE'] || STDIN.gets == "y\n"
        document = klass.with(safe: true).find_or_create_by(create_attributes)
        document.update_attributes(update_attributes) unless update_attributes.empty?
      end
    end

    # Returns the sort name of an area.
    #
    # @param [String] name an area name
    # @return [String] the area's sort name
    def area_sort_name(name)
      sort_name = name.dup
      sort_name = Chronic::Numerizer.numerize(name) if name[/^\D+$/] # Chronic is slow...
      sort_name.upcase!

      # @note Assumes area names contain numbers under 1000.
      # Sort names that start with ordinals properly.
      # @note In OpenStates, MA starts with ordinals.
      if match = sort_name.match(/\A(\d+)(ST|ND|RD|TH)\s*(.+)/)
        "#{match[3]} #{match[1].rjust(3)}#{match[2]}"
      # Sort names that start with numbers properly.
      # @note In OpenStates, MD, MN and SD start with numbers.
      elsif string = sort_name[/\A\d+/]
        sort_name.rjust(sort_name.size + 3 - string.size)
      # Sort names that end with numbers properly.
      # @note In OpenStates, NH and VT end with numbers.
      elsif match = sort_name.match(/(.+?)([\d-]+)\z/)
        match[1] + match[2].split('-').map{|s| s.rjust(3)}.join('-')
      else
        sort_name
      end
    end

    # Warns if any field values match none of the valid keys.
    #
    # @param [Moped::Query] query a query
    # @param [Array<String>] fields a list of fields
    # @param [Array<String>,Regexp] valid a list of valid values
    def assert_valid_values(query, fields, valid)
      fields.each do |field|
        exceptions = query.distinct(field).compact.reject do |value|
          if Array === valid
            valid.include?(value)
          elsif Regexp === valid
            value[valid]
          else
            raise "Invalid argument #{valid.inspect}"
          end
        end
        unless exceptions.empty?
          puts "'#{field}' fields on #{query.collection.name} documents have unrecognized values #{exceptions.map(&:inspect).to_sentence}"
        end
      end
    end

    desc 'Creates an area for each jurisdiction in Billy'
    task jurisdictions: :environment do
      collection(:metadata).find.each do |metadata|
        find_or_create_by_with_prompt(Popolo::Area, {
          name: metadata['name'],
        }, {
          slug: metadata['abbreviation'].parameterize,
          classification: Popolo::Billy.level_field,
        })
      end
    end

    # @note It's possible to calculate Billy's `num_seats` by counting the number of
    #   `posts` for an area, so it's not necessary to create a field.
    desc 'Creates an area for each district in Billy'
    task districts: :environment do
      collection(:districts).find.each do |district|
        if district.key?('abbr')
          find_or_create_by_with_prompt(Popolo::Area, {
            parent_id: Popolo::Area.find_by_slug(district['abbr']),
            classification: district['chamber'],
            name: district['name'],
          }, {
            slug: "#{district['chamber']}-#{district['name']}".parameterize,
            sort_name: area_sort_name(district['name']),
          })
        end
      end
    end

    desc 'Creates an organization for each legislature in Billy'
    task legislatures: :environment do
      collection(:metadata).find.each do |metadata|
        find_or_create_by_with_prompt(Popolo::Organization, {
          name: metadata['legislature_name'],
        }, {
          slug: metadata['abbreviation'].parameterize,
          classification: 'legislature',
          area: Popolo::Area.find_by_slug(metadata['abbreviation']),
        })
      end
    end

    desc 'Creates an organization for each legislative chamber in Billy'
    task chambers: :environment do
      collection(:metadata).find.each do |metadata|
        parent_organization = Popolo::Organization.find_by_slug(metadata['abbreviation'])
        area = Popolo::Area.find_by_slug(metadata['abbreviation'])
        metadata['chambers'].each do |key,chamber|
          find_or_create_by_with_prompt(Popolo::Organization, {
            parent_id: parent_organization,
            name: chamber['name'],
          }, {
            slug: key.parameterize,
            classification: key,
            area: area,
          })
        end
      end
    end

    desc 'Creates an organization for each political party in Billy'
    task parties: :environment do
      collection(:legislators).find.distinct(:party).compact.each do |party_name|
        find_or_create_by_with_prompt(Popolo::Organization, {
          name: party_name,
        }, {
          classification: 'party',
        })
      end
    end

    desc 'Creates a post for each legislative official in Billy'
    task legislative: :environment do
      ENV['RAKE_RUNNING'] = 'yes'

      collection(:metadata).find.each do |metadata|
        parent_area = Popolo::Area.find_by_slug(metadata['abbreviation'])
        parent_organization = Popolo::Organization.find_by_slug(metadata['abbreviation'])

        metadata['chambers'].each do |key,chamber|
          organization = Popolo::Organization.find_by_slug(key, parent_id: parent_organization)

          collection(:districts).find(abbr: metadata['abbreviation'], chamber: key).each do |district|
            area = Popolo::Area.find_by(parent_id: parent_area, classification: key, name: district['name'])
            district['num_seats'].times do |position|
              create_attributes = {organization: organization, area: area, position: position}

              if %w(Mayor Chairman).include?(district['name'])
                name = district['name']
                sort_name = nil
                role = district['name']
              elsif district['name'] == 'At-Large'
                # Optimistically name the post by concatenating the title of
                # members and "At-Large", e.g. "Councilmember At-Large".
                name = "#{chamber['title']} At-Large"
                sort_name = nil
                role = chamber['title']
              else
                # Optimistically name the post by concatenating the title of
                # members and the district name, e.g. "Councilmember for Ward 1".
                name = "#{chamber['title']} for #{district['name']}"
                sort_name = "#{chamber['title']} #{area_sort_name(district['name'])}"
                role = chamber['title']
              end

              slug = if district['num_seats'] > 1
                "#{name} #{position + 1}".parameterize
              end

              update_attributes = {name: name, role: role, slug: slug, sort_name: sort_name}

              post = Popolo::Post.where(create_attributes).first
              if post
                post.update_attributes(update_attributes)
              else
                find_or_create_by_with_prompt(Popolo::Post, create_attributes.merge(update_attributes))
              end
            end
          end
        end
      end
    end

    desc 'Creates a post for each non-legislative official in Billy'
    task nonlegislative: :environment do
      ENV['RAKE_RUNNING'] = 'yes'

      collection(:legislators).find.each do |legislator|
        # @todo This code assumes that the names of non-legislative posts are
        #   unique within organizations, e.g. "Majority Whip".
        legislator['roles'].each do |role|
          unless role.key?('district') || role.key?('committee')
            parent_organization = Popolo::Organization.find_by_slug(role[Popolo::Billy.level_field])
            organization = if role['chamber'].present?
              Popolo::Organization.find_by_slug(role['chamber'], parent_id: parent_organization)
            else
              parent_organization
            end
            find_or_create_by_with_prompt(Popolo::Post, {
              organization: organization,
              name: role['type'],
              role: role['type'],
            })
          end
        end
      end
    end

    # @note If one organization or area is renamed or removed and another is
    #   added, the following checks will fail to discover that.
    desc 'Check the consistency of the Popolo collections'
    task report: :environment do
      # If a jurisdiction or district is renamed or removed, we will have more
      # organizations in the Popolo collection than expected.
      expected = collection(:metadata).find.count + collection(:districts).find.count

      actual = Popolo::Area.count
      unless actual == expected
        puts "Expected #{expected} not #{actual} areas"
      end

      # If a legislature, chamber or party is renamed or removed, we will have
      # more organizations in the Popolo collection than expected.
      expected = collection(:legislators).find.distinct(:party).compact.count + collection(:metadata).find.count
      collection(:metadata).find.each do |metadata|
        expected += metadata['chambers'].size
      end

      actual = Popolo::Organization.count
      unless actual == expected
        puts "Expected #{expected} not #{actual} organizations"
      end

      # If a chamber, district, non-legislative role or non-legislative person
      # is removed from Billy, we will have more posts in the Popolo collection
      # than expected.
      expected = collection(:legislators).find.reduce(0) do |sum,legislator|
        sum + legislator['roles'].count{|role| !role.key?('district') && !role.key?('committee')}
      end
      expected += collection(:districts).find.reduce(0) do |sum,district|
        sum + district['num_seats']
      end

      actual = Popolo::Post.count
      unless actual == expected
        puts "Expected #{expected} not #{actual} posts"
      end
    end

    # @note We can also validate Billy documents against their schemas.
    desc 'Check the consistency of the Billy collections'
    task check: :environment do
      jurisdictions = []
      collection(:metadata).find.each do |metadata|
        jurisdiction = metadata['abbreviation']
        jurisdictions << jurisdiction

        legislators = collection(:legislators).find(Popolo::Billy.level_field => jurisdiction)
        districts = collection(:districts).find(abbr: jurisdiction)

        valid_chambers = metadata['chambers'].keys
        valid_districts = districts.map{|district| district['name']}

        # Within each jurisdiction, validate chamber and district values.
        assert_valid_values(legislators, %w(chamber), valid_chambers)
        assert_valid_values(legislators, %w(roles.chamber old_roles.chamber), valid_chambers + %w(joint))
        assert_valid_values(legislators, %w(district roles.district old_roles.district), valid_districts)
        assert_valid_values(districts, %w(chamber), valid_chambers)
      end

      # Do legislators and districts all belong to valid jurisdictions?
      assert_valid_values(collection(:legislators).find, [Popolo::Billy.level_field, "roles.#{Popolo::Billy.level_field}", "old_roles.#{Popolo::Billy.level_field}"], jurisdictions)
      assert_valid_values(collection(:districts).find, %w(abbr), jurisdictions)

      # Are genders and office types taken from a code list?
      assert_valid_values(collection(:legislators).find, %w(+gender), %w(Female Male))
      assert_valid_values(collection(:legislators).find, %w(offices.type), %w(capitol district))

      # Are images URLs or paths?
      assert_valid_values(collection(:legislators).find, %w(photo_url), /^http/)

      # Does Billy have legislators for every post? (Billy checks this.)
      over = []
      under = []
      collection(:districts).find.each do |district|
        count = collection(:legislators).find(Popolo::Billy.level_field => district['abbr'], chamber: district['chamber'], district: district['name']).count
        if count > district['num_seats']
          over << [count, district['num_seats'], district['abbr'], district['chamber'], district['name']]
        elsif count < district['num_seats']
          under << [count, district['num_seats'], district['abbr'], district['chamber'], district['name']]
        end
      end

      unless over.empty?
        puts "Too many legislators:"
        over.each do |log|
          puts '%d not %d in %s %s %s' % log
        end
      end
      unless under.empty?
        puts "Too few legislators:"
        under.each do |log|
          puts '%d not %d in %s %s %s' % log
        end
      end
    end

    desc 'Create areas for Billy'
    task areas: [
      'popolo:billy:jurisdictions',
      'popolo:billy:districts',
    ]

    desc 'Create organizations for Billy'
    task organizations: [
      'popolo:billy:legislatures',
      'popolo:billy:chambers',
      'popolo:billy:parties',
    ]

    desc 'Create posts for Billy'
    task posts: [
      'popolo:billy:legislative',
      'popolo:billy:nonlegislative',
    ]
  end

  desc 'Create areas, organizations and posts for Billy'
  task billy: [
    'popolo:billy:areas',
    'popolo:billy:organizations',
    'popolo:billy:posts',
    'popolo:billy:report',
  ]
end
