module ApplicationHelper
  def cloudfront(url, width, height)
    image_tag("http://d2xfsikitl0nz3.cloudfront.net/#{CGI.escape(url)}/#{width}/#{height}", alt: '')
  end
end
