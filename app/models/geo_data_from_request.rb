class GeoDataFromRequest
  attr_accessor :request, :geo_data

  def initialize(request)
    @request = request
  end

  def geo_data
    @geo_data = existing_value || request.location

    redis.set(ip, Marshal.dump(@geo_data)) unless existing_value

    @geo_data
  end

  private
  def redis
    @redis ||= Redis.new
  end

  def ip
    @ip ||= request.remote_addr
  end

  def existing_value
    geo_data_as_dump = redis.get(ip)
    geo_data_as_dump.present? ? Marshal.load(geo_data_as_dump) : nil
  end
end
