module ApplicationHelper
  # @param [String] url an image URL
  # @param [Hash] opts optional arguments
  # @option opts [Integer] :width the maximum image width
  # @option opts [Integer] :height the maximum image height
  def cdn_image_tag(url, opts = {})
    width, height = opts[:size].split('x')
    image_tag("http://#{ENV['CLOUDFRONT_DOMAIN_NAME']}/#{CGI.escape(url)}/#{width}/#{height}", opts)
  end

  def jurisdiction_name
    if @area
      @area.root.name
    elsif @organization && @organization.area
      @organization.area.root.name
    elsif @post && @post.area
      @post.area.root.name
    end
  end

  def subheader_on_posts(post)
    parts = []
    parts << post.person['party'] if post.person && post.person['party']
    parts << area_name(post.area) if post.area
    parts.join(', ')
  end

  def subheader_on_post(post)
    parts = []
    parts << post.person['party'] if post.person && post.person['party']
    parts << post.role
    parts << area_name(post.area) if post.area
    parts.join(', ')
  end

  def area_name(area)
    if area.name[/\A[\dA-Z]+\z/]
      "District #{area.name}"
    else
      area.name
    end
  end
end
