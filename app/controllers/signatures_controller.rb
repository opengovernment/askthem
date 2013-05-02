class SignaturesController < ApplicationController
  respond_to :html, :js
  before_filter :authenticate_user!

  def create
    @signature = current_user.signatures.create!(question_id: params[:question_id])
    respond_with(@signature) # @todo redirect if HTML, success if JS, rescue and failure if uniqueness validations fail
  end
end
