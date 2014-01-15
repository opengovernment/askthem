module ApplicationHelper
  def generic_ask_question(text = "Ask a Question", html_options = {})
    url = Rails.env.test? ? "#" : new_question_path(default_jurisdiction)
    link_to text, url, html_options
  end

  def current_url
    request.protocol + request.host_with_port + request.fullpath
  end

  # Called by the page layout and paginators.
  def title(args = {})
    translate_in_controller_scope("#{controller.action_name}.title", params.slice(:page).merge(default: 'AskThem').merge(args))
  end

  # Called by the page layout.
  def description(args = {})
    translate_in_controller_scope("#{controller.action_name}.description", params.slice(:page).merge(default: '').merge(args))
  end

  # @return [Boolean] whether the current jurisdiction is at the federal level
  def federal?
    @jurisdiction && !state? && !local?
  end

  # @return [Boolean] whether the current jurisdiction is at the state level
  def state?
    (@jurisdiction &&
     @jurisdiction.abbreviation[/\A[a-z]{2}\z/] &&
     params[:gov] && params[:gov] == 'state') ||
      (@person && @person.is_a?(StateLegislator))
  end

  # @return [Boolean] whether the current jurisdiction is at the local
  def local?
    @jurisdiction && @jurisdiction.abbreviation[/\A[a-z]{2}-/]
  end

  # @return [String] the abbreviation of the state level jurisdiction
  #   corresponding to the current jurisdiction
  def federal_path
    jurisdiction_path jurisdiction: state_abbreviation
  end

  # @return [String] the abbreviation of the state level jurisdiction
  #   corresponding to the current jurisdiction
  def state_path
    if local?
      jurisdiction_path(jurisdiction: state_abbreviation, gov: 'state')
    elsif state? || federal?
      jurisdiction_path(jurisdiction: @jurisdiction.abbreviation, gov: 'state')
    else
      '#'
    end
  end

  # @return [String] the abbreviation of the local level jurisdiction
  #   corresponding to the current jurisdiction
  def local_path
    if local?
      jurisdiction_path(jurisdiction: @jurisdiction.abbreviation)
    else
      '#'
    end
  end

  def state_abbreviation
    @jurisdiction.abbreviation[/\A[a-z]{2}/]
  end

  def state_name
    if state? || federal?
      @jurisdiction['name']
    elsif local?
      state = Metadatum.where(abbreviation: state_abbreviation).first
      state.nil? ? '#' : state.name
    else
      '#'
    end
  end

  def local_jurisdictions
    Metadatum.where(abbreviation: /#{state_abbreviation}-/i)
  end

  # Return's a bill's truncated title.
  #
  # @param [Bill] bill a bill
  # @return [String] the bill's truncated title
  def short_bill_title(bill)
    truncate(bill['title'].gsub(/\A"|"\z/, ''), length: 95) # an unclosed quotation looks funny, so remove it
  end

  # Used by partials that may not always be within a jurisdiction's scope.
  #
  # @param [Bill,Committee,Person,Vote] object a Billy object
  # @return [Metadatum] the object's jurisdiction
  def jurisdiction(object)
    if @jurisdiction
      @jurisdiction
    else
      @jurisdictions ||= {}
      return Metadatum::Us.find_or_create! if %w(as gu mp vi).include?(object['state'])
      @jurisdictions[object['state']] ||= Metadatum.find_by_abbreviation(object['state'])
    end
  end

  # Returns the URL for the page's Facebook Open Graph image.
  #
  # @return [String] the URL for the page's Facebook Open Graph image
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
    if opts[:size]
      width, height = opts[:size].split('x')
    else
      width, height = opts[:width], opts[:height]
    end

    url = "http:#{url}" if url.present? && url[0..1] == "//"

    if url.blank? || (url.include? 'ballotpedia')
      image_tag("/assets/placeholder.png")
    else
      image_tag("http://d2xfsikitl0nz3.cloudfront.net/#{CGI.escape(url)}/#{width}/#{height}", opts)
    end
  end

  # Returns "video" tag for the remote video
  #
  # @param [String] url an video URL
  # @param [Hash] opts optional arguments
  # @option opts [Integer] :width the maximum width
  # @option opts [Integer] :height the maximum height
  # @return [String] the HTML for an "video" tag
  def cdn_video_tag(url, opts = {})
    if opts[:size]
      width, height = opts[:size].split('x')
    else
      width, height = opts[:width], opts[:height]
    end

    url = "http:#{url}" if url.present? && url[0..1] == "//"

    video_tag("http://d2xfsikitl0nz3.cloudfront.net/#{CGI.escape(url)}", opts)
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

  # Returns HTML options for an "a" tag in the subnavigation bar.
  #
  # @param [String] action the controller action
  # @param [String] scope a translation scope
  # @return [Hash] HTML options for the "a" tag
  def tab_options(action, scope = nil)
    {
      'id' => "#{action}-tab",
      'class' => @tab == action && 'active',
      'data-title' => translate_in_controller_scope("#{scope || action}.title"),
    }
  end

  # Returns HTML options for an "a" tag in the questions filter bar.
  #
  # @param [String] action the controller action
  # @param [String] scope a translation scope
  # @return [Hash] HTML options for the "a" tag
  def filter_options(action, scope = nil)
    {
      id: "#{action}-tab",
      class:  @tab == action ? "radio_button filter active" : "radio_button filter inactive",
      "data-title" => translate_in_controller_scope("#{scope || action}.title"),
    }
  end

  # Returns the person's basic attributes.
  #
  # @param [Person] person a person
  # @return [String] the person's attributes
  def person_attributes(person, delimiter = ", " )
    parts = []
    parts << person.political_position_title

    district_name = district_name(person.most_recent(:district))
    parts << district_name if district_name

    parts << person["party"] if person["party"]
    parts.join(delimiter)
  end

  # @todo flesh this out
  def person_attributes_short(person)
    attributes = person_attributes(person)
    "(#{attributes})" if attributes.present?
  end

  # Formats a district name, if necessary.
  #
  # @param [String] name a district name
  # @return [String] the formatted district name
  def district_name(name)
    if name.to_s[/\A[\dA-Z]+\z/]
      "District #{name}"
    else
      name
    end
  end

  def should_have_ask_question_in_header?
    !(params[:controller] == 'people' &&
      %w(show bills committees votes ratings).include?(params[:action])) &&
      !(params[:controller] == 'questions' && params[:action] == 'show')
  end

  def is_image?(file_or_url)
    return false unless file_or_url.present?

    ImageSrcUrl.new(file_or_url).is_image?
  end

  private
  def translate_in_controller_scope(key, args = {})
    args.reverse_merge!(translate_arguments)
    args[:defaults] = [*args[:default]]
    if args.key?(:page) && args[:page] != 1
      args[:defaults].unshift("#{controller.controller_name}.#{key}")
      key = 'pagination'
    end
    t("#{controller.controller_name}.#{key}", args)
  end

  def translate_arguments
    @translate_arguments ||= begin
      args = {}

      if @jurisdiction
        args[:jurisdiction] = @jurisdiction['name']

        # pages#overview
        if @jurisdiction.lower_chamber?
          args[:lower] = @jurisdiction.chamber_title('lower').pluralize
        end
        if @jurisdiction.upper_chamber?
          args[:upper] = @jurisdiction.chamber_title('upper').pluralize
        end
      end

      if @bill
        args[:bill_id] = @bill['bill_id']
        args[:bill_type] = @bill['type'].first.titleize
        args[:bill_title] = short_bill_title(@bill)
        args[:session] = @bill.session_label
      end

      if @person
        args[:person] = @person.name
        args[:honorary_prefix] = @person.political_position_title
      end

      if @question
        args[:question] = @question.title
      end

      if @subject
        args[:subject] = @subject
      end

      if @user
        args[:user] = @user.name
      end

      args
    end
  end

  def legislature_name
    if @type && @type == 'FederalLegislator'
      "US Congress for #{@jurisdiction.name}"
    else
      @jurisdiction['legislature_name']
    end
  end
end
