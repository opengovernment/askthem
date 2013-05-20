worker_processes 3
timeout 30
preload_app true

before_fork do |server, worker|
  if defined?(Resque)
    Resque.redis.quit
    Rails.logger.info("Disconnected from Redis")
  end
end

after_fork do |server, worker|
  if defined?(Resque)
    Resque.redis = REDIS_WORKER
    Rails.logger.info("Connected to Redis")
  end
end
