module ApplicationHelper
  def translation_arguments
    @translation_arguments ||= begin
      args = {}

      if @jurisdiction
        args[:jurisdiction] = @jurisdiction['name']
      end

      if @bill
        args[:bill_id] = @bill['bill_id']
        args[:bill_type] = @bill['type'].first.titleize
        args[:bill_title] = short_bill_title(@bill)
        args[:session] = @bill.session_label
      end

      if @person
        args[:person] = @person.name
        args[:honorary_prefix] = @jurisdiction.chamber_title(@person['chamber'])
      end

      if @question
        args[:question] = @question.title
      end

      if @user
        args[:user] = @user.name
      end

      args
    end
  end

  def title
    t("#{controller.controller_name}.#{controller.action_name}.title", translation_arguments.merge(default: 'OpenGovernment'))
  end

  def description
    t("#{controller.controller_name}.#{controller.action_name}.description", translation_arguments.merge(default: ''))
  end

  def short_bill_title(bill)
    truncate(bill['title'].gsub(/\A"|"\z/, ''), length: 95)
  end

  def og_image
    if @user && @user.image?
      @user.image.url
    elsif @person && @person.image?
      @person.image
    else
      root_url.chomp('/') + image_path('logo.png')
    end
  end

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

  # Returns the person's basic attributes.
  #
  # @param [Person] person a person
  # @return [String] the person's attributes
  def person_attributes(person)
    parts = []
    parts << @jurisdiction.chamber_title(person['chamber']) if person['chamber']
    parts << district_name(person['district']) if person['district']
    parts << person['party'] if person['party']
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
