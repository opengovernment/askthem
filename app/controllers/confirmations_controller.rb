# Unlike Devise, confirmation emails are resent when an unconfirmed user
# attempts to sign in. It's unlikely that a user will actively seek out the
# "Resend confirmation instructions" page.
#
# @see https://github.com/plataformatec/devise/blob/master/app/controllers/devise/confirmations_controller.rb
class ConfirmationsController < Devise::ConfirmationsController
  force_ssl if Rails.env.production?

  def new
    not_found
  end

  def create
    not_found
  end

  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])

    if resource.errors.empty?
      set_flash_message(:notice, :confirmed) if is_navigational_format?
      sign_in(resource_name, resource)
      respond_with_navigational(resource){ redirect_to after_confirmation_path_for(resource_name, resource) }
    else # this part is different
      set_flash_message(:alert, :invalid_confirmation_token) if is_navigational_format?
      notify_airbrake(StandardError.new("Invalid confirmation token: #{params[:confirmation_token]}"))
      respond_with_navigational(resource.errors, :status => :unprocessable_entity){ redirect_to root_path }
    end
  end
end
