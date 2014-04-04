class ApplicationController < ActionController::Base
  rescue_from Mongoid::Errors::DocumentNotFound, with: :redirect_if_possible_or_return_not_found

  protect_from_forgery

  def geo_data_from_ip
    @geo_data_from_ip ||= GeoDataFromRequest.new(request).geo_data
  end

  def default_jurisdiction
    return @default_jurisdiction if @default_jurisdiction
    abbreviation = if current_user && current_user.region
                     current_user.region
                   elsif has_useable_geo_data_from_ip?
                     geo_data_from_ip.state_code.downcase
                   else
                     "ny"
                   end
    @default_jurisdiction = Metadatum.find_by_abbreviation(abbreviation)
  end

  def has_useable_geo_data_from_ip?
    @has_useable_location ||= geo_data_from_ip &&
      geo_data_from_ip.coordinates != [0,0] &&
      OpenGovernment::STATES.values.include?(geo_data_from_ip.state_code.downcase)
  end

  # @see http://robert-reiz.com/2012/07/09/ssl-in-ruby-on-rails/
  # third party resources make https everywhere problematic
  # before_filter set on individual controllers
  def force_http
    if request.protocol == "https://"
      flash.keep
      location_options = { protocol: "http://", status: :moved_permanently }
      location_options = location_options.merge(request.query_parameters)
      redirect_to location_options
    end
  end

  def state_abbreviation
    return "" unless @jurisdiction

    @jurisdiction.abbreviation[/\A[a-z]{2}/]
  end

  def local_jurisdictions
    return @local_jurisdictions if @local_jurisdictions

    @local_jurisdictions = if state_abbreviation.present?
                             Metadatum.where(abbreviation: /^#{state_abbreviation}-/i)
                           else
                             Metadatum.where(id: [])
                           end
  end

  # @todo pretty ugly, refactor into value object maybe
  def local_jurisdiction
    return @local_jurisdiction if @local_jurisdiction
    if @jurisdiction && @jurisdiction.id.include?("-")
      return @local_jurisdiction = @jurisdiction
    end

    @local_jurisdiction = current_user.local_jurisdiction if current_user

    unless local_jurisdictions.include?(@local_jurisdiction)
      @local_jurisdiction = if has_useable_geo_data_from_ip? &&
                                geo_data_from_ip.state_code.downcase == state_abbreviation
                              Metadatum.where(id: JurisdictionId.new(state: state_abbreviation,
                                                                     municipality: geo_data_from_ip.city).id).first
                            else
                              local_jurisdictions.where(default_city_for_state: true).first || local_jurisdictions.first
                            end
    end

    @local_jurisdiction
  end

  helper_method :default_jurisdiction, :state_abbreviation, :local_jurisdictions, :local_jurisdiction

  private
  def not_found
    respond_to do |format|
      format.html do
        expires_in 1.hour, public: true
        render file: Rails.root.join('public', '404.html'), status: :not_found, layout: false
      end
      format.json { head :not_found }
      format.atom { head :not_found }
    end
  end

  def redirect_if_possible_or_return_not_found
    registered_redirect = RegisteredRedirect.match(request).first

    if registered_redirect
      redirect_to(registered_redirect.new_url_from(request),
                  status: registered_redirect.status_code)
    else
      not_found
    end
  end
end
