class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: :overview

  def index
    @jurisdictions = Metadatum.all.to_a + Metadatum.with(session: 'oglocal').all.to_a
  end

  def overview
  end

  def dashboard
  end
end
