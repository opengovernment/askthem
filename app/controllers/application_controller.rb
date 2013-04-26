class ApplicationController < ActionController::Base
  rescue_from Mongoid::Errors::DocumentNotFound, with: :not_found
  protect_from_forgery

private

  def not_found
    respond_to do |format|
      format.html do
        expires_in 1.hour, public: true
        render file: Rails.root.join('public', '404.html'), status: :not_found, layout: false
      end
      format.json { head :not_found }
      format.atom { head :not_found }
    end
  end
end
