class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: [:overview, :lower, :upper, :bills, :key_votes]
  before_filter :authenticate_user!, only: :dashboard
  caches_action :channel
  respond_to :html
  respond_to :json, only: :locator

  def splash
    render layout: 'splash'
  end

  def index
    @jurisdictions = Metadatum.all.to_a + Metadatum.with(session: 'openstates').all.to_a
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
    @people = Person.with(session: 'openstates').includes(:questions).for_location(params[:q])

    respond_with(@people.as_json({
      only: [
        :full_name,
        :photo_url,
        :party,
      ],
      methods: [
        :id,
        :most_recent_chamber_title,
        :most_recent_district,
      ],
    }))
  end

  def search
    # @todo elasticsearch
  end

  def channel
    expires_in 1.hour, public: true
    render layout: false
  end

private

  def set_jurisdiction
    @jurisdiction = Metadatum.find_by_abbreviation(params[:jurisdiction])
  end

  def tab(tab)
    # Each pair of `@lower` and `@upper` lines must be run together, as below,
    # otherwise the first query to evaluate will clear the persistence options
    # of the unevaluated query.
    @lower = Person.in(@jurisdiction.abbreviation).active.where(chamber: 'lower')
    @lower = @lower.includes(:questions) if tab == 'lower'
    @lower_parties = @lower.group_by{|person| person['party']}

    @upper = Person.in(@jurisdiction.abbreviation).active.where(chamber: 'upper')
    @upper = @upper.includes(:questions) if tab == 'upper'
    @upper_parties = @upper.group_by{|person| person['party']}

    @bills = Bill.in(@jurisdiction.abbreviation).in_session(@jurisdiction.current_session).page(params[:page])
    @bills = @bills.includes(:questions) if tab == 'bills'

    @key_votes = KeyVote.in(@jurisdiction.abbreviation).page(params[:page])

    @tab = tab
    respond_to do |format|
      format.html {render action: 'overview'}
      format.js {render partial: @tab}
    end
  end
end
