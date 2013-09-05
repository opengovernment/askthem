worker_processes 3
timeout 30
preload_app true

# @todo this is only a good set up for staging site on heroku
# revisit when moving to deploying with capistrano
# source: https://coderwall.com/p/fprnhg
before_fork do |server, worker|
  @sidekiq_pid ||= spawn("bundle exec sidekiq -q geocoding -c 2")
end

after_fork do |server, worker|
  Sidekiq.configure_client do |config|
    config.redis = { :size => 1 }
  end

  Sidekiq.configure_server do |config|
    config.redis = { :size => 5 }
  end
end
