class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: :overview

  def index
    @jurisdictions = Metadatum.all
  end

  def overview
  end
end
