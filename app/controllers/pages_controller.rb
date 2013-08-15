class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: [:overview, :lower, :upper, :bills, :key_votes]
  before_filter :authenticate_user!, only: :dashboard
  caches_action :channel
  respond_to :html, except: :identifier
  respond_to :json, only: [:locator, :identifier]

  def splash
    render layout: 'splash'
  end

  def index
    @jurisdictions = Metadatum.all.to_a
    render layout: 'homepage'
  end

  def overview
    if @jurisdiction.upper_chamber?
      tab 'upper'
    else
      tab 'lower'
    end
  end

  def lower
    tab 'lower'
  end

  def upper
    tab 'upper'
  end

  def bills
    tab 'bills'
  end

  def key_votes
    tab 'key_votes'
  end

  def dashboard
    @questions_asked = current_user.questions
    @questions_signed = current_user.questions_signed
  end

  # @see https://github.com/alexreisner/geocoder#use-outside-of-rails
  # @see https://github.com/sunlightlabs/billy/wiki/Differences-between-the-API-and-MongoDB
  def locator
    @people = type.constantize.includes(:questions).for_location(params[:q])
    respond_with limited_json_for(@people)
  end

  def identifier
    # annoying that you can't do case insensitive queries without a regex
    @people = type.constantize.where(email: /^#{params[:email]}$/i)
    respond_with limited_json_for(@people)
  end

  def search
    # @todo elasticsearch
  end

  def channel
    expires_in 1.hour, public: true
    render layout: false
  end

  private
  def limited_json_for(people)
    only = [:full_name, :photo_url, :party]
    methods = [:id, :most_recent_chamber_title, :most_recent_district]

    people.as_json only: only, methods: methods
  end

  def type
    @type ||= params[:type] || 'Person'
  end

  def set_jurisdiction
    @jurisdiction = Metadatum.find_by_abbreviation(params[:jurisdiction])
  end

  def tab(tab)
    # Each pair of `@lower` and `@upper` lines must be run together, as below,
    # otherwise the first query to evaluate will clear the persistence options
    # of the unevaluated query.
    @lower = Person.connected_to(@jurisdiction.abbreviation).active
      .where(chamber: 'lower')
      .only_type(type).page(params[:page])
    @lower = @lower.includes(:questions) if tab == 'lower'
    @lower_parties = @lower.group_by { |person| person['party'] }

    @upper = Person.connected_to(@jurisdiction.abbreviation).active
      .where(chamber: 'upper')
      .only_type(type).page(params[:page])
    @upper = @upper.includes(:questions) if tab == 'upper'
    @upper_parties = @upper.group_by { |person| person['party'] }

    @bills = Bill.connected_to(@jurisdiction.abbreviation)
      .in_session(@jurisdiction.current_session).page(params[:page])
    @bills = @bills.includes(:questions) if tab == 'bills'

    @key_votes = KeyVote.connected_to(@jurisdiction.abbreviation)
      .page(params[:page])

    @tab = tab
    respond_to do |format|
      format.html { render action: 'overview' }
      format.js { render partial: @tab }
    end
  end
end
