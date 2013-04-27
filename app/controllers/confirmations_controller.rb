# Unlike Devise, confirmation emails are resent when an unconfirmed user
# attempts to sign in. It's unlikely that a user will actively seek out the
# "Resend confirmation instructions" page.
class ConfirmationsController < Devise::ConfirmationsController
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
    else
      set_flash_message(:alert, :invalid_confirmation_token) if is_navigational_format?
      # @todo report to airbrake
      respond_with_navigational(resource.errors, :status => :unprocessable_entity){ redirect_to root_path }
    end
  end
end
