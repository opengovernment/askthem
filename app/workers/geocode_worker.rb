class GeocodeWorker
  include Sidekiq::Worker

  def perform(id, class_name = "User")
    object = class_name.constantize.find(id)
    object.geocode
    object.save! if object.changed?
  rescue Mongoid::Errors::DocumentNotFound
    logger.info "#{class_name} : #{id} appears to have been deleted"
  end
end
