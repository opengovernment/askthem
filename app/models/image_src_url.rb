class ImageSrcUrl
  IMAGE_TYPES = %w(jpg jpeg gif png)

  attr_accessor :url

  def initialize(url)
    @url = url
  end

  def is_image?
    IMAGE_TYPES.include?(File.extname(url.downcase).sub(".", ""))
  end
end
