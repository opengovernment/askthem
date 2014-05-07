class PersonCheckPhotoUrlWorker
  include Sidekiq::Worker

  attr_accessor :person

  def perform(id)
    self.person = Person.find(id.to_s)
    return unless person.photo_url.present?

    unless ImageLinkChecker.new(person.photo_url).accessible?
      person.archive_photo_url
    end

  rescue Mongoid::Errors::DocumentNotFound
    logger.info "Person: #{id} appears to have been deleted"
  end
end
