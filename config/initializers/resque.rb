if Rails.env.production?
  Resque.redis = REDIS_WORKER
end
