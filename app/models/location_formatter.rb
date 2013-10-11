class LocationFormatter
  attr_accessor :data

  def initialize(location)
    @data = geodata_from(location)
  end

  def format
    location_is_valid?(data) ? data : nil
  end

  private
  def geodata_from(location)
    if location.is_a?(Geocoder::Result::Base)
      location
    else
      Geocoder.search(location).first
    end
  end

  def location_is_valid?(data)
    data &&
      data.country_code == 'US' &&
      data.latitude.nonzero? &&
      data.longitude.nonzero?
  end
end
