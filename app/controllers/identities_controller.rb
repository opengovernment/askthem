class IdentitiesController < ApplicationController
  before_filter :authenticate_user!

  def update
    @identity = Identity.find(params[:id])
    authorize_action_for @identity

    @event = params[:event]
    @identity.inspection_event(@event, current_user)

    redirect_to user_path(@identity.user)
  end
end
