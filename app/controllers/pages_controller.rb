class PagesController < ApplicationController
  before_filter :set_jurisdiction, only: :overview
  before_filter :authenticate_user!, only: :dashboard
  caches_action :channel

  def index
    @jurisdictions = Metadatum.all.to_a + Metadatum.with(session: 'openstates').all.to_a
  end

  def overview
    # @todo cut this page?
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
    @jurisdiction ||= Metadatum.find(params[:jurisdiction])
  end
end
