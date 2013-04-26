require 'project_vote_smart'

namespace :projectvotesmart do
  def api
    ProjectVoteSmart.new(api_key: ENV['PROJECT_VOTE_SMART_API_KEY'])
  end

  desc 'Update categories from Project VoteSmart'
  task categories: :environment do
    api.get('State.getStateIDs').each do |state|
      begin
        api.get('Rating.getCategories', stateId: state['stateId']).each do |response|
          record = RatingCategory.find_or_initialize_by(categoryId: response['categoryId'])
          record.attributes = response
          record.save
        end
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No categories for #{state['name']} (#{state['stateId']})"
      end
    end
  end

  desc 'Update interest groups from Project VoteSmart'
  task special_interest_groups: :environment do
    RatingCategory.each do |category|
      begin
        api.get('Rating.getSigList', categoryId: category.categoryId).each do |partial|
          response = api.get('Rating.getSig', sigId: partial['sigId'])
          record = RatingGroup.find_or_initialize_by(sigId: response['sigId'])
          record.attributes = response
          record.save
        end
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No special interest groups for #{category.name} (#{category.categoryId})"
      end
    end
  end

  desc 'Update interest group ratings for OpenStates legislators from Project VoteSmart'
  task ratings: :environment do
    Person.with(session: 'openstates').where(votesmart_id: {'$ne' => nil}).each do |person|
      begin
        ratings = api.get('Rating.getCandidateRating', candidateId: person['votesmart_id'])['rating']
        ratings = [ratings] unless Array === ratings

        ratings.each do |response|
          categories = response.delete('categories')['category']
          categories = [categories] unless Array === categories

          # Assumes that a person appears once per special interest group scorecard.
          record = Rating.find_or_initialize_by(ratingId: response['ratingId'], person_id: person.id)
          unless record # 
            record.attributes = response
            record.categories = categories.map{|category| category['categoryId']}
            record.save
          end
        end
      rescue ProjectVoteSmart::DocumentNotFound
        puts "No ratings for #{person.name} (#{person['votesmart_id']})"
      end
    end
  end

  desc 'Update key votes from Project VoteSmart'
  task key_votes: :environment do
    # @todo
  end
end
