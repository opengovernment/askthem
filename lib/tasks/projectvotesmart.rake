# coding: utf-8
require 'project_vote_smart'

namespace :projectvotesmart do
  class String
    # Remove all diacritics, spaces, punctuation and control characters.
    def fingerprint
      gsub(/`|\p{Punct}|\p{Cntrl}|[[:space:]]/, '').tr(
        "ÀÁÂÃÄÅàáâãäåĀāĂăĄąÇçĆćĈĉĊċČčÐðĎďĐđÈÉÊËèéêëĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħÌÍÎÏìíîïĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłÑñŃńŅņŇňŉŊŋÒÓÔÕÖØòóôõöøŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšſŢţŤťŦŧÙÚÛÜùúûüŨũŪūŬŭŮůŰűŲųŴŵÝýÿŶŷŸŹźŻżŽž",
        "AAAAAAaaaaaaAaAaAaCcCcCcCcCcDdDdDdEEEEeeeeEeEeEeEeEeGgGgGgGgHhHhIIIIiiiiIiIiIiIiIiJjKkkLlLlLlLlLlNnNnNnNnnNnOOOOOOooooooOoOoOoRrRrRrSsSsSsSssTtTtTtUUUUuuuuUuUuUuUuUuUuWwYyyYyYZzZzZz"
      ).downcase
    end
  end

  def api
    ProjectVoteSmart.new(api_key: ENV['PROJECT_VOTE_SMART_API_KEY'])
  end

  def officials_by_state_and_office(stateId, *officeIds)
    officeIds.each_with_index do |officeId,index|
      begin
        return api.get('Officials.getByOfficeState', officeId: officeId, stateId: stateId.upcase)
      rescue ProjectVoteSmart::DocumentNotFound => e
        raise e if index + 1 == officeIds.size # if none of the officeIds work
      end
    end
  end

  # OpenStates doesn't maintain votesmart_id anymore.
  # @see https://github.com/sunlightlabs/billy/commit/8658cd6675503bee82b2860c7e25220fb0921242
  desc "Get each person's Project VoteSmart ID"
  task people: :environment do
    ids = Person.with(session: 'openstates').where(active: true, votesmart_id: nil).map(&:id) # no index
    ids -= PersonDetail.where(person_id: {'$in' => ids}, votesmart_id: {'$ne' => nil}).map(&:person_id)

    found = 0
    puts "Matching #{ids.size}..."

    Person.with(session: 'openstates').find(ids).group_by do |person|
      [person['state'], person['chamber']]
    end.each do |(state,chamber),people| # up to 104 iterations
      begin
        # @see http://api.votesmart.org/docs/semi-static.html
        officials = if chamber == 'lower'
          officials_by_state_and_office(state, 7, 8) # State Assembly, State House
        else
          officials_by_state_and_office(state, 9) # State Senate
        end

        people.each do |person|
          officials.each do |o|
            # OpenStates may leave in unnecessary suffixes, e.g. "Jim Anderson (SD28)".
            family_name = if person.family_name[/\A\([A-Z0-9]+\)\z/]
              person.given_name[/(\S+)\z/]
            else
              person.family_name
            end.sub(/,? (?:III|IV|Jr\.|M\.D\.|SR|Sr\.)\z/, '')

            # OpenStates and Project VoteSmart may have more or fewer family
            # names, e.g. "Navarro" versus "Navarro-Ratzlaff", "Turner" versus
            # "Turner Lairy" or "Oakes" versus "Erwin Oakes".
            a = [
              family_name,
              family_name[/\S+\z/],
            ]
            a.map!(&:fingerprint)

            b = [
              o['lastName'],
              o['lastName'][/\A\p{L}+/],
              o['lastName'][/\p{L}+\z/],
            ].compact.map(&:fingerprint)

            # It is very unlikely that there would be two people with the same
            # family name elected to the same district in a short time span.
            # @note Project VoteSmart sometimes assigns the wrong party, e.g.
            # Sam Watson in Georgia is Republican, not Democratic.
            if person['district'] == o['officeDistrictName'] && (a & b).present?
              person_detail = person.person_detail
              person_detail.votesmart_id = o['candidateId']
              person_detail.save
              found += 1
            end
          end
        end
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No officials for #{chamber} house in state #{state}"
      end
    end

    puts "#{found} of #{ids.size} matched"
  end

  desc 'Update special interest groups from Project VoteSmart'
  task special_interest_groups: :environment do
    # There is no endpoint to get a list of all categories across all states, so
    # we must build the list one state at a time. There is a lot of duplication.
    categories = Set.new
    api.get('State.getStateIDs').each do |state| # 56 iterations
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
          RatingScorecard.set(:retrieved, Time.now)
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
    # @todo http://api.votesmart.org/docs/Votes.html
    # @see lib/open_gov/key_votes.rb in OG 1.0

    # The following all return billId, billNumber, title, type
    # Votes.getBillsByYearState
    # Votes.getBillsByStateRecent
    # Votes.getByBillNumber

    # Votes.getBill
    # Votes.getBillAction
  end
end
