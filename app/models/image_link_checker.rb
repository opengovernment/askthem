class ImageLinkChecker
  attr_accessor :url

  def initialize(url)
    @url = url
  end

  def accessible?
    uri = URI(url)

    Net::HTTP.start(uri.host,
                    uri.port,
                    use_ssl: uri.scheme == "https",
                    verify_mode:
                    OpenSSL::SSL::VERIFY_NONE) do |http|

      response = http.request_head(uri.path, headers)
      # fallback to full request if server doesn't respond to head only request
      response = http.request_get(uri.path, headers) if response.blank?

      # if it isn't an image, always false
      return false unless response["content-type"].include?("image")

      is_available?(response)
    end
  end

  private
  def headers
    { "User-Agent" =>
      "Ruby Net/HTTP used for link checking mechanism AskThem.io" }
  end

  def is_available?(response)
    case response
    when Net::HTTPNotFound then false
    when Net::HTTPSuccess then true
    when Net::HTTPRedirection
      redirection_available?(response)
    else
      false
    end
  end

  def redirection_available?(response)
    location = response["location"]
    unless location.include?("://")
      host_with_protocol = url[/^[^\:]+\:\/\/[^\/]+/, 0]
      location = host_with_protocol + location
    end
    self.class.new(location).accessible?
  end
end
