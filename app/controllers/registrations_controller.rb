class RegistrationsController < Devise::RegistrationsController
  # @note Unlike Devise, no destruction (until we sort out orphaned content).
  def destroy
    redirect_to action: 'edit'
  end
end
