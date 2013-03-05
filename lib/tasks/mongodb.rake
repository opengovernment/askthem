namespace :mongodb do
  def database
    @database ||= begin
      path = Rails.root.join('config', 'mongoid.yml')
      config = YAML.load(ERB.new(File.read(path)).result)
      config['development']['sessions']['default']['database']
    end
  end

  def uri
    @uri ||= begin
      url = nil
      %w(MONGO_URL MONGOHQ_URL MONGOLAB_URI).find do |constant|
        url = `heroku config:get #{constant}`.chomp
      end
      URI.parse(url)
    end
  end

  desc 'Copy a development database to production'
  task push: :environment do
    if Rails.env.development?
      puts <<-END
 !    WARNING: Destructive Action
 !    Data in the app will be overwritten by data in #{database} and will not be recoverable.
 !    To proceed, type "nogoingback"
END
      if STDIN.gets == "nogoingback\n"
        puts `mongodump -h localhost -d #{database} -o dump-dir`.chomp
        puts `mongorestore -h #{uri.host}:#{uri.port || '27017'} -d #{uri.path.sub('/', '')} -u #{uri.user} -p #{uri.password} --drop dump-dir/#{database}`.chomp
      else
        puts 'Confirmation did not match "nogoingback". Aborted.'
      end
    else
      puts 'rake mongodb:push can only be run in development'
    end
  end

  desc 'Copy a production database to development'
  task pull: :environment do
    if Rails.env.development?
      puts <<-END
 !    WARNING: Destructive Action
 !    Data in #{database} will be overwritten by data in the app and will not be recoverable.
 !    To proceed, type "nogoingback"
END
      if STDIN.gets == "nogoingback\n"
        puts `mongodump -h #{uri.host}:#{uri.port || '27017'} -d #{uri.path.sub('/', '')} -u #{uri.user} -p #{uri.password} -o dump-dir/`.chomp
        puts `mongorestore -h localhost -d #{database} --drop dump-dir/#{database}`.chomp
      else
        puts 'Confirmation did not match "nogoingback". Aborted.'
      end
    else
      puts 'rake mongodb:pull can only be run in development'
    end
  end
end
