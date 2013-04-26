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

  def switch_database
    Mongoid.override_session(OpenGovernment.session(params[:jurisdiction]))
  end

  def reset_database
    Mongoid.override_session(nil)
  end

  def not_found
    expires_in 1.hour, public: true
    render file: Rails.root.join('public', '404.html'), status: :not_found, layout: false
  end
end
