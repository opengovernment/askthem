class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: [:overview, :lower, :upper, :bills,
                                          :key_votes, :meetings]
  before_filter :authenticate_user!, only: [:contact_info]
  before_filter :check_can_view_contact_info, only: :contact_info
  caches_action :channel
  respond_to :html, except: [:identifier, :contact_info]
  respond_to :json, only: [:locator, :identifier]
  respond_to :csv, only: [:contact_info]

  def map
    if params[:jurisdiction]
      @jurisdiction = Metadatum.find_by_abbreviation(params[:jurisdiction])
    end
    if @jurisdiction
      @current_state = @jurisdiction.abbreviation.split("-").first
    end
    @states = states_info
  end

  def splash
    render layout: "splash"
  end

  def index
    @jurisdictions = Metadatum.all.to_a

    @national_answers_count = Answer.count
    @national_signatures_count = Signature.count
    @national_questions = Question.order_by(signature_count: "desc").limit(3)

    @user_city = request.location ? request.location.city : "New York"
    # coordinates have to be in GEOjson order, thus reverse
    center = request.location ? request.location.coordinates.reverse : [-73.9998334,
                                                                        40.7195898]

    @near_questions = Question
      .where(:coordinates => { "$within" => { "$center" => [center, 1] } })
    near_ids = @near_questions.collect(&:id)

    @near_signatures = Signature.in(question_id: near_ids)
    @near_answers = Answer.in(question_id: near_ids)
    @near_questions = @near_questions.order_by(signature_count: "desc").limit(3)

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
  def check_can_view_contact_info
    unless current_user.can?(:view_contact_info)
      raise Authority::SecurityViolation.new(current_user,
                                             :view_contact_info,
                                             PagesController)
    end
  end

  def set_variables_for(address)
    geodata = Geocoder.search(address).first
    center = geodata.coordinates.reverse

    @municipality = geodata.city

    @questions = Question.includes(:user)
      .where(:coordinates => { "$within" => { "$center" => [center, 1] } })
      .order_by(signature_count: "desc").limit(10)

    @federal_people = FederalLegislator.includes(:questions, :identities)
      .for_location(geodata)

    @state_people = StateLegislator.includes(:questions, :identities, :metadatum)
      .for_location(geodata)

    # since we return all councilmembers for a city, regardless of "nearness"
    # order alphabetically by last name
    @municipal_people = Mayor.includes(:questions, :identities)
      .for_location(geodata) +
      Councilmember.includes(:questions, :identities, :metadatum)
      .for_location(geodata).order_by([["last_name", "ASC"]])

    @governor = Governor.includes(:questions, :identities, :metadatum)
      .for_location(geodata).first
  end

  def limited_json_for(people)
    only = [:party]
    methods = [:id, :full_name, :photo_url,
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
    @governor = Governor.connected_to(@jurisdiction.abbreviation).first
    @mayor = Mayor.connected_to(@jurisdiction.abbreviation).first ||
      Councilmember.connected_to(@jurisdiction.abbreviation)
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
  rescue
    # @todo report error and non-coverage of address
    limited_json_for(Person.results_for_location(@address))
  end
end
