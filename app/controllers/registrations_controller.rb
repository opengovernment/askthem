class RegistrationsController < Devise::RegistrationsController
  # @note Unlike Devise, no destruction (until we sort out orphaned content).
  def destroy
    not_found
  end

private

  def after_update_path_for(resource)
    user_path(resource)
  end
end
