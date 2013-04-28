# @see https://github.com/sunlightlabs/billy/wiki/Differences-between-the-API-and-MongoDB
namespace :openstates do
  def openstates
    if ENV['SUNLIGHT_API_KEY']
      Mongoid.override_session('openstates')
      yield
      Mongoid.override_session(nil)
    else
      abort "ENV['SUNLIGHT_API_KEY'] is not set"
    end
  end

  desc 'Update metadata, legislators, committees and bills from OpenStates'
  task update: :environment do
    openstates do
      # @todo
    end
  end

  namespace :json do
    desc 'Download OpenStates JSON'
    task download: :environment do
      openstates do
        JSON.parse(RestClient.get("http://openstates.org/api/v1/metadata/?fields=latest_json_date,latest_json_url&apikey=#{ENV['SUNLIGHT_API_KEY']}")).each do |remote|
          local = Metadatum.find(remote['id'])
          if local.nil? || local['latest_json_date'].to_i < Time.parse(remote['latest_json_date'] + 'UTC').to_i
            filepath = Rails.root.join('tmp', File.basename(remote['latest_json_url']))
            unless File.exist?(filepath)
              `curl -o #{filepath} #{remote['latest_json_url']}`
            end
          end
        end
      end
    end

    desc 'Update legislators, committees and bills from OpenStates JSON downloads'
    task update: :download do
      openstates do
        # @todo loop through files, updating documents if updated_at is newer, removing files as you go
      end
    end
  end

  namespace :api do
    desc 'Update metadata from OpenStates API'
    task metadata: :environment do
      openstates do
        # @todo 1 call
      end
    end


    desc 'Update legislators from OpenStates API'
    task legislators: :environment do
      openstates do
        # @todo 1 call per state
      end
    end

    desc 'Update committees from OpenStates API'
    task committees: :environment do
      openstates do
        # @todo 1 call
      end
    end

    desc 'Update bills from OpenStates API'
    task bills: :environment do
      openstates do
        # @todo use updated_since
        # @todo complete https://github.com/sunlightlabs/billy/wiki/Differences-between-the-API-and-MongoDB
      end
    end
  end
end
