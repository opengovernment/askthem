class GeoDataFromRequest
  attr_accessor :request, :geo_data

  def initialize(request)
    @request = request
  end

  def geo_data
    @geo_data = existing_value || request.location

    redis.set(ip, Marshal.dump(@geo_data)) unless existing_value

    @geo_data
  rescue Errno::ECONNREFUSED, Errno::ECONNRESET
    nil
  end

  private
  def redis
    @redis ||= Redis.new
  rescue Redis::CannotConnectError
    NullRedis.new
  end

  def ip
    @ip ||= request.remote_addr
  end

  def existing_value
    geo_data_as_dump = redis.get(ip)
    geo_data_as_dump && !geo_data_as_dump.empty? ? Marshal.load(geo_data_as_dump) : nil
  end

  # answer the same API that we need from Redis, but do nothing
  # useful for handling connectivity issues
  class NullRedis
    def set(key, value)
    end

    def get(key)
    end
  end
end
