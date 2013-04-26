class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: [:overview, :lower, :upper, :bills]
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

  def dashboard
    @questions_asked = current_user.questions
    @questions_signed = current_user.questions_signed
  end

  def search
    # @todo
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
    @lower = Person.in(@jurisdiction['abbreviation']).where(chamber: 'lower')
    @upper = Person.in(@jurisdiction['abbreviation']).where(chamber: 'upper')
    @lower_parties = @lower.group_by{|person| person['party']}
    @upper_parties = @upper.group_by{|person| person['party']}
    @bills = Bill.in(@jurisdiction['abbreviation']).includes(:metadatum).desc('action_dates.last').page(params[:page])

    @tab = tab
    respond_to do |format|
      format.html {render action: 'overview'}
      format.js {render partial: @tab}
    end
  end
end
