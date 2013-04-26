class SubjectsController < ApplicationController
  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :show
  actions :index, :show

  def show
    show! do |format|
      @bills = Bill.where({
        state: @jurisdiction.abbreviation,
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
    Bill.where(state: parent.id).distinct('subjects')
  end
end
