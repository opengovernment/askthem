# @see http://sunlightlabs.github.io/openstates-api/
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

  # Inspired by mongodb.rake
  def config
    @config ||= begin
      path = Rails.root.join('config', 'mongoid.yml')
      config = YAML.load(ERB.new(File.read(path)).result)
      config
    end
  end
 
  def host(i=0, session='default')
    hosts = config[Rails.env]['sessions'][session]['hosts']
    i < hosts.count ? hosts[i].split(':')[0] : nil
  end
 
  def port(i=0, session='default')
    hosts = config[Rails.env]['sessions'][session]['hosts']
    i < hosts.count ? hosts[i].split(':')[1] : '27017'
  end
 
  def username(session='default')
    config[Rails.env]['sessions'][session]['username']
  end
 
  def password(session='default')
    config[Rails.env]['sessions'][session]['password']
  end
 
  def database(session='default')
    config[Rails.env]['sessions'][session]['database']
  end
 
  # Inspired by https://gist.github.com/erik-eide/1233435
  def db_connection_options(i=0, session='default')
    auth_string = ''
    auth_string += "-u #{username(session)} " unless username(session).blank?
    auth_string += "-p #{password(session)} " unless password(session).blank?

    conn_string = "--host #{host(i, session)} --port #{port(i, session)} #{auth_string} -d #{database(session)}"
    conn_string
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
      OPENSTATES_SESSION = 'openstates'

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
               mongoimport = "mongoimport --stopOnError #{db_connection_options(0, OPENSTATES_SESSION)} -c #{zipdirname} --type json --file \"#{mongodoc}\" --upsert"

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
end
