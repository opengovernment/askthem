# url set via env var
Sidekiq.configure_server do |config|
  config.redis = { namespace: "askthem_queues" }
end

Sidekiq.configure_client do |config|
  config.redis = { namespace: "askthem_queues" }
end
