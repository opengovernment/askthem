class GeocodeWorker
  include Sidekiq::Worker
  sidekiq_options queue: :geocoding

  def perform(id, class_name = "User")
    object = class_name.constantize.find(id)
    object.geocode
    object.save! if object.changed?
  end
end
