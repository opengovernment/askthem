require 'project_vote_smart'

# @see http://sunlightlabs.github.io/congress/
namespace :congress do
  def openstates
    if ENV['SUNLIGHT_API_KEY']
      Mongoid.override_session('openstates')
      yield
      Mongoid.override_session(nil)
    else
      abort "ENV['SUNLIGHT_API_KEY'] is not set"
    end
  end

  namespace :api do
    namespace :download do
      desc 'Download legislators from Congress API'
      task legislators: :environment do
        openstates do
          # get all possible matching officials (us senate, house) in 2 requests
          # rather than per created legislator
          pvs_api = ProjectVoteSmart.new
          officials = pvs_api.officials_by_state_and_office('us', [5])
          officials += api.officials_by_state_and_office('us', [6])

          CongressProcessor::Legislators.new.run officials: officials
        end
      end
    end
  end

  private
  class CongressProcessor
    attr_accessor :page, :per_page, :url, :api_key

    def initialize
      @page = 1
      @per_page = 50
      @url = "#{target_class.base_api_url}/#{target_class.api_plural_type}"
      @api_key = target_class.api_key
    end

    # override in subclass if different
    def target_class
      FederalLegislator
    end

    def params
      { apikey: api_key, page: page, per_page: per_page }
    end

    def run(options = {})
      json = JSON.parse(RestClient.get(url, params: params))
      json['results'].each { |result| process(result, options) }

      unless json['page']['count'] < per_page
        self.page = page + 1
        run options
      end
    end

    def process(result, options = {})
      # check for existing person, skip if there is one, at least for now
      unless target_class.in('us')
          .where(id: result[target_class.api_id_field]).count > 0
        target_class.create_from_apis result, options
      end
    end

    class Legislators < CongressProcessor
      def fields
        'bioguide_id,first_name,middle_name,last_name,state,votesmart_id,email,gender,name_suffix,photo_url,twitter_id,chamber,district,party,terms'
      end

      def params
        super.merge({ fields: fields })
      end
    end
  end
end
