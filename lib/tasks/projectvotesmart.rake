# coding: utf-8
require 'project_vote_smart'

namespace :projectvotesmart do
  def api
    ProjectVoteSmart.new
  end

  # @todo this doesn't do anything and it needs to handle non-state metadatum
  desc 'Imports state governors and city mayors for Open States jurisdictions from Project VoteSmart'
  task governors: :environment do
    relevant_metadata.each do |metadatum|
      # @see http://api.votesmart.org/docs/semi-static.html
      officials = api.officials_by_state_and_office(metadatum.abbreviation.upcase, [3, 73]) # Governor, Mayor

      # @see https://github.com/sunlightlabs/billy/blob/master/billy/importers/legislators.py#L17
      # @todo Respect the above Billy code for importing legislators.

      officials.each do |official|
        # @todo Remember to store the votesmart_id.
      end
    end
  end

  # OpenStates doesn't maintain votesmart_id anymore.
  # @see https://github.com/sunlightlabs/billy/commit/8658cd6675503bee82b2860c7e25220fb0921242
  desc "Get each person's Project VoteSmart ID"
  task people: :environment do
    ids = Person.where(active: true, votesmart_id: nil).map(&:id) # no index
    ids -= PersonDetail.where(person_id: {'$in' => ids}, votesmart_id: {'$ne' => nil}).map(&:person_id)

    found = 0
    puts "Matching #{ids.size}..."

    # Iterates over people without a Project VoteSmart ID.
    Person.find(ids).group_by do |person|
      [person['state'], person['chamber']]
    end.each do |(state,chamber),people| # up to 104 iterations
      begin
        office_ids = api.office_ids(state: state, chamber: chamber)
        officials = api.officials_by_state_and_office(state, office_ids)

        people.each do |person|
          person_detail = ProjectVoteSmartPersonDetail.new(person, officials: officials)
            .person_detail

          if person_detail.changed?
            person_detail.save!
            found += 1
          end
        end
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No officials for #{chamber} house in state #{state}"
      end
    end

    puts "#{found} of #{ids.size} matched"
  end

  # Project VoteSmart has far fewer bills than OpenStates, so we loop through
  # Project VoteSmart's bills, not OpenStates'.
  # @note Project VoteSmart uses the LD number in Maine, whereas OpenStates uses
  #   the HP and SP numbers, making it impossible to match Maine's bills.
  # @see https://code.google.com/p/openstates/issues/detail?id=779
  desc "Get each bill's Project VoteSmart ID"
  task bills: :environment do
    found = 0

    year = Date.today.year # we don't care about historical bills
    relevant_metadata.each do |metadatum|
      stateId = metadatum.abbreviation.upcase
      begin
        api.get('Votes.getBillsByYearState', year: year, stateId: stateId).uniq do |bill|
          # Project VoteSmart inexplicably returns multiple bills with the same
          # `billId` and `billNumber`, but with slightly different `title`.
          bill['billId']
        end.each do |bill|
          unless BillDetail.where(votesmart_id: bill['billId']).first
            # OG 1.0 does some string manipulation to overcome differences in
            # bill numbers. We can use MongoDB's regular expression matches
            # instead if the below rules are insufficient.
            # @see https://github.com/opengovernment/opengovernment/blob/master/app/models/bill.rb#L42
            bill_id = bill['billNumber'].squeeze(' ')

            # It may be possible for Project VoteSmart to return a bill from a
            # earlier session with the same bill number as a bill in the current
            # session, and we accidentally match that Project VoteSmart `billId`
            # to a bill in the current session. Cross your fingers!
            # @see https://github.com/opengovernment/opengovernment/blob/master/lib/open_gov/key_votes.rb#L27
            session = if bill['billNumber'][/\A[A-Z]+x\d+\b/]
              # @todo OG 1.0 would try to match VoteSmart's session number to
              #   OpenStates's display_name, but display_name may distinguish
              #   between special sessions within the same year by including the
              #   month or another word like "Fiscal" instead, or it may use an
              #   ordinal instead of a number. For now, we simply find the most
              #   recent special session.
              bill_id.sub!(/x\d+/, '')
              metadatum.current_special_session
            else
              metadatum.current_regular_session
            end

            # OpenStates (so far) has a space between the letters and the number.
            if bill_id[/\A[A-Z]+\d/]
              bill_id.sub!(/(?=\d)/, ' ')
            end

            # In CO, OpenStates has, e.g. "HB 13-001" but VoteSmart has "HB 1".
            if stateId == 'CO' && bill_id[/\A([HS]B) (\d+)\z/]
              bill_id = "#{$1} #{Date.today.strftime('%y')}-#{'%03d' % $2}"
            # In RI, OpenStates uses "HB" but VoteSmart uses "H".
            elsif stateId == 'RI' && bill_id[/\AH\b/]
              bill_id.sub!(/\AH\b/, 'HB')
            end

            scope = Bill.connected_to(metadatum.abbreviation).in_session(session).where(bill_id: bill_id)

            if scope.count > 1
              puts "Multiple bills in state #{stateId} in session #{session} match bill number #{bill['billNumber']}"
            elsif scope.count == 1
              BillDetail.create!(bill: scope.first, votesmart_id: bill['billId'])
              found += 1
            else
              puts "No bills in state #{stateId} in session #{session} match bill number #{bill['billNumber']} (#{bill['title'].inspect})"
            end
          end
        end
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No bills for state #{stateId} in #{year}"
      end
    end

    puts "#{found} matched"
  end

  desc 'Update special interest groups from Project VoteSmart'
  task special_interest_groups: :environment do
    # There is no endpoint to get a list of all categories across all states, so
    # we must build the list one state at a time. There is a lot of duplication.
    categories = Set.new
    states = api.get('State.getStateIDs')

    if ENV['ONLY']
      only_states = ENV['ONLY'].split(',').collect(&:upcase)
      states = states.keep_if { |state| only_states.include?(state['stateId']) }
    end

    states.each do |state| # 56 iterations
      begin
        categories += api.get('Rating.getCategories', stateId: state['stateId'])
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No categories for state #{state['name']} (#{state['stateId']})"
      end
    end

    # There is no endpoint to get a list of all special interest groups across
    # all states and categories, so we must build the list one category at a
    # time. There is a lot of duplication.
    categories.each do |category| # 43 iterations
      begin
        api.get('Rating.getSigList', categoryId: category['categoryId']).each do |partial|
          group = api.get('Rating.getSig', sigId: partial['sigId'])
          record = RatingGroup.find_or_initialize_by(sigId: group['sigId'])
          record.attributes = group
          record.save
        end
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No special interest groups for category #{category['name']} (#{category['categoryId']})"
      end
    end
  end

  desc 'Update special interest group scorecards from Project VoteSmart'
  task scorecards: :environment do
    RatingGroup.each do |group| # 344 iterations
      begin
        scorecards = api.get('Rating.getSigRatings', sigId: group.sigId)['rating']
        scorecards = [scorecards] unless Array === scorecards

        scorecards.each do |scorecard|
          record = RatingScorecard.find_or_initialize_by(ratingId: scorecard['ratingId'])
          record.attributes = group.attributes.slice('sigId', 'name', 'description')
          record.attributes = scorecard
          record.save
        end
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No scorecards for special interest group #{group.name} (#{group.sigId})"
      end
    end
  end

  desc 'Update special interest group ratings for OpenStates legislators from Project VoteSmart'
  task ratings: :environment do
    # `Rating.getCandidateRating` is the only way to get categories for ratings,
    # but it is very expensive to use that API endpoint, as you must loop
    # through all people on each run. We instead use `Rating.getRating`, which
    # allows us to only request the ratings for new scorecards.

    # According to Mike Shultz <mike@votesmart.org>, scorecards are almost
    # always static once entered. However, there may be occasional corrections
    # and additions. Here, we simply import once.

    # Iterating over many records for too long may raise a
    # `Moped::Errors::CursorNotFound` exception.
    # @see https://gist.github.com/dblock/2783755
    criteria = RatingScorecard.where(retrieved: nil).asc(:ratingId)

    index = 0
    scorecards = criteria.clone.limit(100)

    while scorecards.any?
      scorecards.each do |scorecard| # 1600+ iterations on first run
        begin
          api.get('Rating.getRating', ratingId: scorecard.ratingId).each do |rating|
            record = Rating.find_or_initialize_by(candidateId: rating['candidateId'], ratingId: scorecard.ratingId)
            record.attributes = scorecard.attributes
            record.attributes = rating
            record.save
          end
          scorecard.set(:retrieved, Time.now)
        rescue ProjectVoteSmart::DocumentNotFound
          puts "No ratings for scorecard #{scorecard.ratingName} (#{scorecard.ratingId})"
        end
      end

      index += 100
      scorecards = criteria.clone.limit(100).skip(index)
    end
  end

  desc 'Update key votes from Project VoteSmart'
  task key_votes: :environment do
    # @todo https://github.com/opengovernment/opengovernment/blob/master/lib/open_gov/key_votes.rb#L63

    # @see http://api.votesmart.org/docs/Votes.html
    # Votes.getBill(billId)
    # Votes.getBillAction(actionId)
  end

  def relevant_metadata
    relevant_metadata = Metadatum.nin(abbreviation: Metadatum::Us::ABBREVIATION)
    if ENV['ONLY']
      only_abbreviations = ENV['ONLY'].split(',')
      relevant_metadata = Metadatum.in(abbreviation: only_abbreviations)
    end
    relevant_metadata
  end
end
