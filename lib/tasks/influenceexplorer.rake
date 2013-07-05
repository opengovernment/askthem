require 'influence_explorer'

namespace :influenceexplorer do
  desc 'Get contributions from the Influence Explorer API'
  task contributions: :environment do
    # @todo see lib/open_gov/contributions.rb in OG 1.0
  end

  desc 'Get biographies and biography URLs from the Influence Explorer API'
  task biographies: :environment do
    if ENV['SUNLIGHT_API_KEY']
      include ActionView::Helpers::SanitizeHelper

      # Collect entity IDs that 404.
      not_found_urls = []

      criteria = Person.where(transparencydata_id: {'$nin' => ['', nil]}).asc(:transparencydata_id) # no index
      progressbar = ProgressBar.create(format: '%a |%B| %p%% %e', length: 80, smoothing: 0.5, total: criteria.with(session: 'openstates').count)

      index = 0
      people = criteria.clone.with(session: 'openstates').limit(100)

      while people.any?
        people.each do |person|
          progressbar.increment

          # Assume biographies never change.
          next if person.person_detail.persisted?

          begin
            person_detail = InfluenceExplorerPersonDetail.new(person).person_detail
            if person_detail.biography_changed? || person_detail.links.any?(&:changed?)
              person_detail.save!
            end
          rescue RestClient::ResourceNotFound
            not_found_urls << person.transparencydata_id
          end
        end

        index += 100
        people = criteria.clone.with(session: 'openstates').limit(100).skip(index)
      end

      puts not_found_urls
    else
      abort "ENV['SUNLIGHT_API_KEY'] is not set"
    end
  end
end
