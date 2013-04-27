require 'project_vote_smart'

namespace :projectvotesmart do
  def api
    ProjectVoteSmart.new(api_key: ENV['PROJECT_VOTE_SMART_API_KEY'])
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
          response = api.get('Rating.getSig', sigId: partial['sigId'])
          record = RatingGroup.find_or_initialize_by(sigId: response['sigId'])
          record.attributes = response
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

        scorecards.each do |response|
          record = RatingScorecard.find_or_initialize_by(ratingId: response['ratingId'])
          record.attributes = group.attributes.slice('sigId', 'name', 'description')
          record.attributes = response
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
    # through all people. We instead use `Rating.getRating`, which allows us to
    # only request the ratings for new scorecards.

    # OpenStates doesn't maintain votesmart_id anymore.
    # @see https://github.com/sunlightlabs/billy/commit/8658cd6675503bee82b2860c7e25220fb0921242

    # Iterating over many records for too long may raise a
    # `Moped::Errors::CursorNotFound` exception.
    # @see https://gist.github.com/dblock/2783755
    criteria = RatingScorecard.where(retrieved: nil).asc(:ratingId)

    index = 0
    scorecards = criteria.clone.limit(100)

    while scorecards.any?
      scorecards.each do |scorecard| # 1600+ iterations on first run
        begin
          api.get('Rating.getRating', ratingId: scorecard.ratingId).each do |response|
            # @todo need to get votesmart_id for each person
            #   need to get votesmart_id from PersonDetail going forward
            person = Person.with(session: 'openstates').where(votesmart_id: response['candidateId']).first
            if person
              record = Rating.find_or_initialize_by(person_id: person.id, ratingId: scorecard.ratingId)
              record.attributes = scorecard.attributes
              record.attributes = response
              record.save
            end
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
    # @todo
  end
end
