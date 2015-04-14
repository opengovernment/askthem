class PagesController < ApplicationController
  DEFAULT_GEOJSON_CENTER = [-73.9998334, 40.7195898]
  DEFAULT_MUNICIPALITY = "New York"

  skip_before_filter :verify_authenticity_token, :only => [:locator, :identifier]

  before_filter :force_http

  before_filter :set_jurisdiction, only: [:overview, :lower, :upper, :bills,
                                          :key_votes, :meetings]
  before_filter :authenticate_user!, only: [:contact_info]
  before_filter :check_can_view_contact_info, only: :contact_info
  caches_action :channel
  respond_to :html, except: [:identifier, :contact_info]
  respond_to :json, only: [:locator, :identifier]
  respond_to :csv, only: [:contact_info]

  after_filter :set_access_control_headers, only: [:locator, :identifier]

  # in case locator was a post
  after_filter :store_location_for_locator, only: [:locator]

  def candidates
  end

  def honestads
  end

  def widget_builder
  end

  def map
    if params[:jurisdiction]
      @jurisdiction = Metadatum.find_by_abbreviation(params[:jurisdiction])
    end
    if @jurisdiction
      @current_state = @jurisdiction.abbreviation.split("-").first
    end
    @states = states_info
    @cities = Metadatum.where(abbreviation: /-/).order_by(abbreviation: "asc").includes(:questions)
  end

  def splash
    render layout: "splash"
  end

  def index
    @jurisdictions = Metadatum.all.to_a

    # @todo spec
    @featured_answer = Answer.featured.first

    # @todo spec
    @blurb = Blurb.active.where(target_url: "/").first

    # set_national_variables
    # set_near_variables
    @national_person = Person.featured.first

    render layout: "homepage"
  end

  def overview
    if @jurisdiction.upper_chamber?
      tab "upper"
    else
      tab "lower"
    end
  end

  def lower
    tab "lower"
  end

  def upper
    tab "upper"
  end

  def bills
    tab "bills"
  end

  def key_votes
    tab "key_votes"
  end

  def meetings
    tab "meetings"
  end

  # @see https://github.com/alexreisner/geocoder#use-outside-of-rails
  # @see https://github.com/sunlightlabs/billy/wiki/Differences-between-the-API-and-MongoDB
  def locator
    @address = params[:q]
    if request.format != :json
      set_variables_for(@address)

      @only_show = params[:only_show]

      set_referring_partner_if_necessary

      set_question_skeleton_if_necessary

      set_candidates_if_referring_partner

      redirect_to_partner_page_if_no_address
    else
      respond_with locator_json_for(@address)
    end
  end

  def identifier
    respond_with limited_json_for(PeopleIdentifier.new(params).people)
  end

  # must be staff member
  # @param jurisdictions
  # @param type
  def contact_info
    @people = Person.active.only_types(types)

    @limit_to_jurisdictions = params[:limit_to_jurisdictions]
    if @limit_to_jurisdictions
      @people = @people.in(state: @limit_to_jurisdictions.split(","))
    end
  end

  def search
    # @todo elasticsearch
  end

  def channel
    expires_in 1.hour, public: true
    render layout: false
  end

  private
  # mongodb coordinates have to be in GEOjson order, thus reverse
  def center
    @center ||= if has_useable_geo_data_from_ip?
                  geo_data_from_ip.coordinates.reverse
                else
                  DEFAULT_GEOJSON_CENTER
                end
  end

  def user_city
    @user_city ||= if has_useable_geo_data_from_ip?
                     geo_data_from_ip.city
                   else
                     DEFAULT_MUNICIPALITY
                   end
  end

  # @todo spec
  def near_person
    @near_person ||= if @near_questions && @near_questions.any?
                       not_in_ids = @near_questions.collect(&:person_id)
                       Person.connected_to(@near_questions.first.state)
                         .nin(id: not_in_ids).first
                     else
                       Person.connected_to(default_jurisdiction).first
                     end
  end

  def near_government
    @near_government ||= if has_useable_geo_data_from_ip?
                           Metadatum.local_to(geo_data_from_ip.city,
                                              geo_data_from_ip.state_code)
                         end
  end

  def set_near_variables
    user_city
    near_government

    @near_questions = Question.in(needs_confirmation: [nil, false])
      .where(:coordinates => { "$within" => { "$center" => [center, 1] } })
    near_ids = @near_questions.collect(&:id)

    @near_signatures = Signature.in(question_id: near_ids)
    @near_answers = Answer.in(question_id: near_ids)
    @near_questions = @near_questions.order_by(signature_count: "desc").limit(6)

    near_person
  end

  def set_national_variables
    # @todo spec
    @national_person = Person.featured.first

    @national_answers_count = Answer.count
    @national_signatures_count = Signature.count
    @national_questions = Question.in(needs_confirmation: [nil, false])
                          .order_by(signature_count: "desc").limit(6)
  end

  def check_can_view_contact_info
    unless current_user.can?(:view_contact_info)
      raise Authority::SecurityViolation.new(current_user,
                                             :view_contact_info,
                                             PagesController)
    end
  end

  def set_variables_for(address)
    geodata = Geocoder.search(address).first

    if geodata
      center = geodata.coordinates.reverse

      @municipality = geodata.city

      @questions = Question.includes(:user).in(needs_confirmation: [nil, false])
        .where(:coordinates => { "$within" => { "$center" => [center, 1] } })
        .order_by(signature_count: "desc").limit(10)

      @federal_people = FederalLegislator.includes(:questions, :identities).active
        .for_location(geodata)

      @state_people = StateLegislator.includes(:questions, :identities, :metadatum).active
        .for_location(geodata)

      # since we return all councilmembers for a city, regardless of "nearness"
      # order alphabetically by last name
      @municipal_people = Mayor.includes(:questions, :identities).active
        .for_location(geodata) +
        Councilmember.includes(:questions, :identities, :metadatum).active
        .for_location(geodata).order_by([["last_name", "ASC"]])

      @governor = Governor.includes(:questions, :identities, :metadatum).active
        .for_location(geodata).first
    else
      flash.now[:alert] = "Whoops! We couldn't find a location for #{address}."
    end
  end

  def limited_json_for(people)
    only = [:party]
    methods = [:id, :full_name, :photo_url, :state,
               :political_position_title, :most_recent_district]

    people.as_json only: only, methods: methods
  end

  def types
    @types ||= if params[:gov]
                 @gov = params[:gov]
                 case @gov
                 when "state"
                   ["StateLegislator"]
                 when "federal"
                   ["FederalLegislator"]
                 end
               else
                 if @jurisdiction && @jurisdiction.abbreviation.include?("-")
                   ["Councilmember"]
                 else
                   ["FederalLegislator"]
                 end
               end
  end

  def set_jurisdiction
    @jurisdiction = Metadatum.find_by_abbreviation(params[:jurisdiction])
  end

  def tab(tab)
    @governor = Governor.connected_to(@jurisdiction.abbreviation).active.first
    @mayor = Mayor.connected_to(@jurisdiction.abbreviation).active.first ||
      Councilmember.connected_to(@jurisdiction.abbreviation).active
      .where(district: "Mayor").first

    # Each pair of `@lower` and `@upper` lines must be run together, as below,
    # otherwise the first query to evaluate will clear the persistence options
    # of the unevaluated query.
    @lower = Person.connected_to(@jurisdiction.abbreviation).active
      .where(chamber: "lower")
      .only_types(types)
    @lower_parties = @lower.group_by { |person| person["party"] }
    if tab == "lower"
      @lower = @lower.includes(:questions, :identities)
      unless types.include?("FederalLegislator")
        @lower = @lower.includes(:metadatum)
      end
    end
    @lower = @lower.page(params[:page])

    @upper = Person.connected_to(@jurisdiction.abbreviation).active
      .where(chamber: "upper")
      .only_types(types)
    @upper_parties = @upper.group_by { |person| person["party"] }
    if tab == "upper"
      @upper = @upper.includes(:questions, :identities)
      unless types.include?("FederalLegislator")
        @upper = @upper.includes(:metadatum)
      end
    end
    @upper = @upper.page(params[:page])

    @bills = Bill.connected_to(@jurisdiction.abbreviation)
      .in_session(@jurisdiction.current_session).page(params[:page])
    # bills not tied to questions at moment
    # @bills = @bills.includes(:questions) if tab == "bills"

    @key_votes = KeyVote.connected_to(@jurisdiction.abbreviation)
      .page(params[:page])

    @meetings = Meeting.connected_to(@jurisdiction.abbreviation)
      .page(params[:page])
      .order_by(:date_and_time.desc)

    @tab = tab
    respond_to do |format|
      format.html { render action: "overview" }
      format.js { render partial: @tab }
    end
  end

  # @todo cache or otherwise optimize
  def question_count_for(state_code)
    count = Metadatum.find(state_code).questions.count

    # cities and counties are under their own metadatum
    Metadatum.where(abbreviation: /^#{state_code}-/).each do |subjurisdiction|
      count += subjurisdiction.questions.count
    end
    count
  end

  def states_info
    OpenGovernment::STATES.inject({}) do |states, state_array|
      name, abbr = state_array
      states[name] = { abbr: abbr, count: question_count_for(abbr) }
      states
    end
  end

  def locator_json_for(address)
    limited_json_for(CachedOfficialsFromGoogle.new(@address))
  rescue => e
    logger.info("GoogleCivicInfo error or parsing error: #{e}")
    # @todo report error and non-coverage of address
    limited_json_for(Person.results_for_location(@address))
  end

  def set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Request-Method'] = '*'
  end

  # sometimes params picks up hash values automatically (url query string)
  # other times not (post), so unfortunately we are bit defensive here
  def set_referring_partner_if_necessary
    @has_partner = (params[:partner] ||
                    params["partner[name]"].present? ||
                    params["partner[url]"].present?)

    if @has_partner
      referring_partner_info = if params[:partner]
                                 params[:partner]
                               else
                                 { name: params["partner[name]"],
                                   url: params["partner[url]"] }
                               end

      referring_partner_info[:submitted_address] = params[:q]
      referring_partner_info[:return_url] = request.referer

      session[:referring_partner_info] = referring_partner_info
    end
  end

  # sometimes params picks up hash values automatically (url query string)
  # other times not (post), so unfortunately we are bit defensive here
  def set_question_skeleton_if_necessary
    if (params[:question] || params["question[title]"] ||
        params["question[body]"])

      question_skeleton = if params[:question]
                            params[:question]
                          else
                            { title: params["question[title]"],
                              body: params["question[body]"] }
                          end

      session[:question_skeleton] = question_skeleton
    end
  end

  def people_collections
    people_collections = {}

    people_collections[:governor_ids] = [@governor.id] if @governor

    if @federal_people
      people_collections[:federal_people_ids] = @federal_people.collect(&:id)
    end

    if @state_people
      people_collections[:state_people_ids] = @state_people.collect(&:id)
    end

    if @municipal_people
      people_collections[:municipal_people_ids] = @municipal_people.collect(&:id)
    end

    people_collections
  end

  def candidates_for(ids)
    Candidate.includes(:questions, :identities, :metadatum,
                       :current_office_holder).
      active.
      in(current_office_holder_id: ids)
  end

  def update_variable_of_with(variable_name, candidates)
    unless variable_name == "@governor"
      existing_people = instance_variable_get(variable_name)
      instance_variable_set(variable_name, existing_people + candidates)
    end
  end

  def set_candidates_if_referring_partner
    return unless @has_partner

    extra_state_candidates = []
    people_collections.each do |name, ids|
      next unless ids.any?

      variable_name = "@#{name.to_s.sub('_ids', '')}"

      if variable_name == "@governor"
        extra_state_candidates = candidates_for(ids)
      elsif variable_name == "@state_people"
        candidates = extra_state_candidates + candidates_for(ids)
      else
        candidates = candidates_for(ids)
      end

      update_variable_of_with(variable_name, candidates)
    end
  end

  def redirect_to_partner_page_if_no_address
    if @address.blank? && session[:referring_partner_info]
      partnership_page = "/#{session[:referring_partner_info][:name].gsub(" ", "_")}"
      redirect_to partnership_page.downcase
    end
  end

  def store_location_for_locator
    session[:previous_url] = "/locator?q=#{params[:q]}&only_show=#{params[:only_show]}"
  end
end
