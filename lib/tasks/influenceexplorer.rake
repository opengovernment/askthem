namespace :influenceexplorer do
  desc 'Get biographies and biography URLs from the Influence Explorer API'
  task biographies: :environment do
    if ENV['SUNLIGHT_API_KEY']
      include ActionView::Helpers::SanitizeHelper
      Mongoid.override_session('openstates')

      people = Person.where(transparencydata_id: {'$ne' => ['', nil]})
      progressbar = ProgressBar.create(format: '%a |%B| %p%% %e', length: 80, smoothing: 0.5, total: people.count)

      not_found_urls = []

      people.each do |person|
        progressbar.increment

        # Assume biographies never change.
        next if person.person_detail.persisted?

        # Reset the incremental backoff.
        wait = 1

        begin
          response = JSON.parse(RestClient.get("http://transparencydata.com/api/1.0/entities/#{person.transparencydata_id.strip}.json?apikey=#{ENV['SUNLIGHT_API_KEY']}"))

          person_detail = PersonDetail.new
          if response['metadata']['bio']
            person_detail.biography = strip_tags(response['metadata']['bio']).strip
          end
          if response['metadata']['bio_url']
            link = person_detail.links.find_or_initialize_by(note: 'Wikipedia')
            link.url = response['metadata']['bio_url']
          end
          if person_detail.biography_changed? || person_detail.links.any?(&:changed?)
            person_detail.person = person
            person_detail.save!
          end
        rescue Errno::ECONNRESET, RestClient::ServerBrokeConnection
          wait *= 2 # incremental backoff
          sleep wait
          retry
        rescue RestClient::ResourceNotFound
          not_found_urls << person.transparencydata_id
        end
      end

      # Print entity IDs that 404.
      not_found_urls.each do |url|
        puts url
      end
    else
      abort "ENV['SUNLIGHT_API_KEY'] is not set"
    end
  end
end
