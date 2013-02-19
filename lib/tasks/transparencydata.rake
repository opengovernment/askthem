namespace :transparencydata do
  desc 'Download biographies and biography URLs from Transparency Data'
  task biographies: :environment do
    if ENV['SUNLIGHT_API_KEY']
      include ActionView::Helpers::SanitizeHelper

      query = Person.where(transparencydata_id: {'$ne' => nil})
      #progressbar = ProgressBar.create(format: '%a |%B| %p%% %e', length: 80, smoothing: 0.5, total: query.count)

      urls = []
      wait = 1

      query.each do |person|
        #progressbar.increment
        if person.person_detail.persisted?
          print '.'
          next
        end

        begin
          response = JSON.parse(RestClient.get("http://transparencydata.com/api/1.0/entities/#{person.transparencydata_id.strip}.json?apikey=#{ENV['SUNLIGHT_API_KEY']}"))
          wait = 1 # reset incremental backoff

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
          puts "Waiting #{wait}..."
          sleep wait
          retry
        rescue RestClient::ResourceNotFound
          urls << person.transparencydata_id
        end
      end

      urls.each do |url|
        puts url
      end
    else
      abort "ENV['SUNLIGHT_API_KEY'] is not set"
    end
  end
end
