module ApplicationHelper
  # @param [String] url an image URL
  # @param [Integer] width the maximum image width
  # @param [Integer] height the maximum image height
  # @param [Hash] opts optional arguments
  def cloudfront(url, width, height, opts = {})
    image_tag("http://d2xfsikitl0nz3.cloudfront.net/#{CGI.escape(url)}/#{width}/#{height}", opts)
  end
end
