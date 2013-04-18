class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: :overview
  before_filter :authenticate_user!, only: :dashboard
  caches_action :channel

  def index
    @jurisdictions = Metadatum.all.to_a + Metadatum.with(session: 'openstates').all.to_a
  end

  def overview
  end

  def dashboard
  end

  def channel
    expires_in 1.hour, public: true
    render layout: false
  end
end
