class SubjectsController < ApplicationController
  inherit_resources
  respond_to :html
  respond_to :js, only: :show
  actions :index, :show

  before_filter :set_jurisdiction

  def show
    show! do |format|
      @bills = Bill.where({
        state: @jurisdiction.id,
        subjects: @subject,
        session: @jurisdiction.current_session, # not in index
      }).desc('action_dates.last').page(params[:page])
      format.js {render partial: 'page'}
    end
  end

private

  def collection
    @subjects ||= subjects.sort
  end

  def resource
    @subject ||= subjects.find{|subject| subject.parameterize == params[:id]}
  end

  # @note MT, RI and WI have inconsistent subject names (typos, etc.).
  def subjects
    Bill.where(state: @jurisdiction.id).distinct('subjects')
  end
end
