class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  # If a user is already signed in, do not allow Facebook sign in.
  prepend_before_filter :require_no_authentication, only: :facebook

  # @see https://github.com/plataformatec/devise/wiki/OmniAuth:-Overview
  def facebook
    user = User.where(authentications: {'$elemMatch' => request.env['omniauth.auth'].slice('provider', 'uid')}.to_hash).first
    if user
      # Forces all authentication callbacks.
      sign_in_and_redirect(user, event: :authentication)
    else
      session['devise.facebook_data'] = request.env['omniauth.auth'].to_hash
      redirect_to new_user_registration_path
    end
  end
end
