class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: [:overview, :lower, :upper, :bills, :votes]
  before_filter :authenticate_user!, only: :dashboard
  caches_action :channel

  def index
    @jurisdictions = Metadatum.all.to_a + Metadatum.with(session: 'openstates').all.to_a
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

  def votes
    tab 'votes'
  end

  def dashboard
    @questions_asked = current_user.questions
    @questions_signed = current_user.questions_signed
  end

  def search
    # @todo OgLocal, OpenStates, DemocracyMap
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
    @lower_parties = @lower.group_by{|person| person['party']}
    @upper = Person.in(@jurisdiction.abbreviation).active.where(chamber: 'upper')
    @upper_parties = @upper.group_by{|person| person['party']}
    @bills = Bill.in(@jurisdiction.abbreviation).in_session(@jurisdiction.current_session).page(params[:page])
    @votes = [] # @todo stub

    @tab = tab
    respond_to do |format|
      format.html {render action: 'overview'}
      format.js {render partial: @tab}
    end
  end
end
