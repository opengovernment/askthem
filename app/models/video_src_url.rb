class VideoSrcUrl
  VIDEO_TYPES = %w(avi mov mpg mpeg divx mp4 mpv ogv webm)

  VIDEO_SITE_URL_PATTERNS = {
    youtube: [/youtu\.be\/([^?]+)/, /youtube\.com\/watch\?v=([^&]+)/],
    vimeo: [/vimeo.com\/([^?]+)/] }

  VIDEO_SITE_VIEWER_BASES = { youtube: "http://youtube.com/embed/",
    youtube_full: "http://www.youtube.com/embed/",
    vimeo: "http://player.vimeo.com/video/" }

  attr_accessor :original_url, :value

  def initialize(url)
    @original_url = url
  end

  def is_video?
    is_video_service_src? || VIDEO_TYPES.include?(extension_for(value.downcase))
  end

  def value
    @value ||= if has_extension? || is_video_service_src?(original_url)
                 original_url
               else
                 replace_with_viewer_url
               end
  end

  private
  def replace_with_viewer_url
    site_key, video_id = find_site_key_and_video_id
    Rails.logger.debug "what is player url: #{VIDEO_SITE_VIEWER_BASES[site_key]}#{video_id}"
    "#{VIDEO_SITE_VIEWER_BASES[site_key]}#{video_id}"
  end

  def find_site_key_and_video_id
    VIDEO_SITE_URL_PATTERNS.each do |key, value|
      value.each do |pattern|
        if original_url =~ pattern
          return [key, $1]
        end
      end
    end
  end

  #     VIDEO_SITE_URL_PATTERNS.values.flatten.select { |v| url =~ v }.any?
  def is_video_service_src?(url = value)
    matches = VIDEO_SITE_VIEWER_BASES.values.select { |v| url.include?(v) }
    matches.any?
  end

  def extension_for(file_or_url)
    File.extname(file_or_url).sub(".", "") if file_or_url
  end

  def has_extension?
    extension_for(original_url).present?
  end
end
