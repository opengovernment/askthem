require "legislator"
require "sunlight_congress_legislator_adapter"

class FederalLegislator < Person
  include Legislator

  PHOTOS_BASE_URL = "http://#{ENV['AWS_DIRECTORY']}#{ENV['AWS_HOST_STUB']}/photos/federal/100x125/"

  def self.default_api
    SunlightCongressLegislatorService
  end

  def image?
    persisted? && id.present?
  end

  def image
    "#{PHOTOS_BASE_URL}#{id}.jpg"
  end

  alias_method :photo_url, :image

  def political_position_title
    case political_position
    when "upper"
      "Senator"
    when "lower"
      "Representative"
    end
  end

  private
  def adapt(attributes, options = {})
    adapter = options[:adapter] || SunlightCongressLegislatorAdapter.new(self)
    super(attributes, options.merge({ adapter: adapter }))
  end
end
