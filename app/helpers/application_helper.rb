module ApplicationHelper
  # Returns an "img" tag for the remote image.
  #
  # @param [String] url an image URL
  # @param [Hash] opts optional arguments
  # @option opts [Integer] :width the maximum image width
  # @option opts [Integer] :height the maximum image height
  # @return [String] the HTML for an "img" tag
  def cdn_image_tag(url, opts = {})
    width, height = opts[:size].split('x')
    image_tag("http://d2xfsikitl0nz3.cloudfront.net/#{CGI.escape(url)}/#{width}/#{height}", opts)
  end

  # Returns an "a" tag for the navigation tab.
  #
  # @param [String] body the link text
  # @param [String,Hash] url_options the link URL
  # @param [Hash] html_options HTML attributes
  # @return the HTML for an "a" tag
  def tab(body, url_options, html_options = {})
    if current_page?(url_options)
      html_options[:class] ||= ''
      html_options[:class] << ' active'
    end
    link_to body, url_options, html_options
  end

  # Returns a person's name prefixed by their role's title
  #
  # @param [Person] person a person
  # @return [String] the person's name prefixed by their role's title
  def name_with_title(person)
    [ @jurisdiction.chamber_title(person['chamber']),
      person.name,
    ].join(' ')
  end

  # Returns the person's basic attributes.
  #
  # @param [Person] person a person
  # @return [String] the person's attributes
  def person_attributes(person)
    parts = []
    parts << person['party'] if person['party'].present?
    parts << district_name(person['district']) if person['district'].present?
    parts.join(', ')
  end

  # Formats a district name, if necessary.
  #
  # @param [String] name a district name
  # @return [String] the formatted district name
  def district_name(name)
    if name[/\A[\dA-Z]+\z/]
      "District #{name}"
    else
      name
    end
  end
end
