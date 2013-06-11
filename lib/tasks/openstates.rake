# @see http://sunlightlabs.github.io/openstates-api/
# @see https://github.com/sunlightlabs/billy/wiki/Differences-between-the-API-and-MongoDB
namespace :openstates do
  OPENSTATES_SESSION = 'openstates'

  def openstates
    if ENV['SUNLIGHT_API_KEY']
      Mongoid.override_session(OPENSTATES_SESSION)
      yield
      Mongoid.override_session(nil)
    else
      abort "ENV['SUNLIGHT_API_KEY'] is not set"
    end
  end

  def tmpdir
    dir = Rails.root.join('tmp')
    Dir.mkdir(dir) unless File.exists?(dir)
    abort "#{dir} is not a directory" unless File.directory?(dir)
    dir
  end

  # http://sunlightlabs.github.io/openstates-api/metadata.html
  def openstates_metadata_url
    "http://openstates.org/api/v1/metadata/?fields=latest_json_date,latest_json_url&apikey=#{ENV['SUNLIGHT_API_KEY']}"
  end

  def extract_from_json_document(filename)

    # Read the input JSON into a string
    begin
      jsonstr = File.open(filename) {|f| f.read}
    rescue Exception => e
      puts e.message
      return nil, nil
    end

    # Deserialize JSON string into a Ruby object
    begin
      obj = JSON(jsonstr)
    rescue Exception => e
      puts e.message
      return nil, nil
    end

    return obj['id'], obj['updated_at']
  end
 
  desc 'Update metadata, legislators, committees and bills from OpenStates'
  task update: :environment do
    openstates do
      # @todo mixed strategy using both JSON downloads and API
    end
  end

  namespace :json do
    desc 'Download OpenStates JSON'
    task download: :environment do
      Mongoid.raise_not_found_error = false

      openstates do
        JSON.parse(RestClient.get(openstates_metadata_url)).each do |remote|
          filepath = File.join(tmpdir, File.basename(remote['latest_json_url']))
          local = Metadatum.find(remote['id'])

          if ! File.exist?(filepath) && (local.nil? || local['latest_json_date'].to_i < Time.parse(remote['latest_json_date'] + 'UTC').to_i)
            puts "Downloading #{remote['id']}..."
            `curl -s -o #{filepath} #{remote['latest_json_url']}`
          end

        end
      end
    end

    # Inspired by https://gist.github.com/erik-eide/1233435
    # @todo report any documents that are in the local DB but not in the JSON downloads (e.g. could be a merged legislator)
    desc 'Update legislators, committees and bills from OpenStates JSON downloads'
    task update: :download do
      require 'find'
      require 'fileutils'

      db = OpenstatesDatabase.new('session' => OPENSTATES_SESSION)

      openstates do

        # Process each zip file we have
        Dir.glob("#{tmpdir}/*.zip").each do |zipfile|
           dirs_in_zip = `unzip -l #{zipfile} | egrep -v 'Archive|Length|----|files$' | awk '{print $4}' | awk -F/ '{print $1}' | sort -u`.scan(/^.*$/)

           # Ensure a clean slate before unzipping
           dirs_in_zip.each {|zipdirname| FileUtils.rm_rf("#{tmpdir}/#{zipdirname}")}

           # Unzip
           puts "Unzipping #{zipfile}"
           unzip = "unzip -d #{tmpdir} #{zipfile}"

           rc = system("#{unzip} 1>/dev/null")
           abort "unzip failed: #{unzip}" unless rc

           File.delete(zipfile)

           # Traverse the unzipped directories
           # http://www.ruby-doc.org/stdlib-1.9.3/libdoc/find/rdoc/Find.html
           dirs_in_zip.each do |zipdirname|
             zipdir = "#{tmpdir}/#{zipdirname}"

             Find.find(zipdir) do |path|

               # Process a directory
               if FileTest.directory?(path)
                 File.basename(path)[0] == '.' ? Find.prune : next
                 abort "Should never reach this"
               end

               mongodoc = path
               puts "  #{mongodoc.sub("#{tmpdir}/", '')}"
               json_id, json_updated_at = extract_from_json_document(mongodoc)

               ## @todo Skip updating document if database updated_at is newer
               #objs = Committee.where(id: json_id)
               #abort "#{objs.count} entries of committee #{json_id}" unless objs.count == 1
               #next if json_updated_at.to_i <= objs.first.updated_at.to_i

               # Import the document into MongoDB
               # Assume directory name maps to MongoDB collection name
               # http://docs.mongodb.org/manual/reference/program/mongoimport/
               # http://docs.mongodb.org/manual/core/import-export/
               mongoimport = "mongoimport --stopOnError #{db.connection_options} -c #{zipdirname} --type json --file \"#{mongodoc}\" --upsert"

               rc = system("#{mongoimport} 1>/dev/null")
               abort "mongoimport failed: #{mongoimport}" unless rc

               File.delete(mongodoc) if File.exists?(mongodoc)
             end

             FileUtils.rm_rf("#{zipdir}")
           end
        end
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
        # complete docs at https://github.com/sunlightlabs/billy/wiki/Differences-between-the-API-and-MongoDB
      end
    end
  end

  private
  class OpenstatesDatabase
    attr_reader :config, :session, :hostnum

    # Inspired by mongodb.rake
    def initialize(params)
      @config ||= begin
        path = Rails.root.join('config', 'mongoid.yml')
        config = YAML.load(ERB.new(File.read(path)).result)
        abort "Invalid mongoid config: #{path}" unless config.is_a?(Hash) && !config[Rails.env].blank?
        config
      end
      @session = params['session'].blank? ? 'default' : params['session']
      @hostnum = params['hostnum'].blank? ? 0         : params['hostnum'].to_i
      abort "hostnum #{params['hostnum']} cannot exceed #{hosts.count-1}" if @hostnum >= hosts.count
    end

    def hosts
      config[Rails.env]['sessions'][session]['hosts']
    end
 
    def host
      hosts.blank? ? nil : hosts[hostnum].split(':')[0]
    end
 
    def port
      hosts.blank? ? nil : hosts[hostnum].split(':')[1]
    end
 
    def username
      config[Rails.env]['sessions'][session]['username']
    end
 
    def password
      config[Rails.env]['sessions'][session]['password']
    end
 
    def database
      config[Rails.env]['sessions'][session]['database']
    end
 
    # Inspired by https://gist.github.com/erik-eide/1233435
    def connection_options
      conn_string = ''
      conn_string += "--host #{host} "         unless host.blank?
      conn_string += "--port #{port} "         unless port.blank?
      conn_string += "--username #{username} " unless username.blank?
      conn_string += "--password #{password} " unless password.blank?
      conn_string += "--db #{database} "       unless database.blank?
      conn_string
    end

  end # OpenstatesDatabase

end
