class UsersController < ApplicationController
  respond_to :html

  def show
    @user = User.find(params[:id])
    respond_with @user # @todo check arguments for caching
  end
end
