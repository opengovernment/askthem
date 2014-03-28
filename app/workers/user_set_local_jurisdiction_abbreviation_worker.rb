class UserSetLocalJurisdictionAbbreviationWorker
  include Sidekiq::Worker

  attr_accessor :user

  def perform(id)
    user = User.find(id.to_s)
    options = set_options_from(user)

    return if options[:state].nil?

    user.local_jurisdiction_abbreviation = JurisdictionId.new(options).id
    user.save!

  rescue Mongoid::Errors::DocumentNotFound
    logger.info "User: #{id} appears to have been deleted"
  end

  private
  def set_options_from(user)
    state = user.region
    municipality = user.locality

    if user.coordinates && (state.blank? || municipality.blank?)
      geo = Geocoder.search(user.coordinates.reverse).first
      state = geo.state_code
      municipality = geo.city
    end

    { state: state, municipality: municipality }
  end
end
