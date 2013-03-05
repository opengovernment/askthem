class ApplicationController < ActionController::Base
  rescue_from Mongoid::Errors::DocumentNotFound do |exception|
    respond_to do |format|
      format.html { render file: Rails.root.join('public', '404.html'), status: :not_found, layout: false }
      format.json { head :not_found }
      format.atom { head :not_found }
    end
  end
  protect_from_forgery

  before_filter :switch_database
  after_filter :reset_database

private

  def set_jurisdiction
    @jurisdiction ||= Metadatum.find(params[:jurisdiction])
  end

  def switch_database
    Mongoid.override_session('oglocal') if @jurisdiction && !@jurisdiction.id[/\A[a-z]{2}\z/]
  end

  def reset_database
    Mongoid.override_session(nil)
  end
end
