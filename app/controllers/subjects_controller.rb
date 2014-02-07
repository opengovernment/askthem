class SubjectsController < ApplicationController
  before_filter :force_http

  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction
  respond_to :html
  respond_to :js, only: :show
  actions :index, :show

  def show
    show! do |format|
      @bills = chain.recent.where(subjects: @subject)
        .includes(:questions)
        .page(params[:page]) # no index includes `session`, so we omit it

      format.js { render partial: "page" }
    end
  end

  private
  # @note MT, RI and WI have inconsistent subject names (typos, etc.).
  def chain
    Bill.connected_to(parent.abbreviation)
  end

  def collection
    @subjects ||= chain.distinct("subjects").sort
  end

  def resource
    @subject ||= chain.distinct("subjects")
      .find { |subject| subject.parameterize == params[:id].parameterize }

    raise Exception, "Subject #{params[:id]} not valid" unless @subject

    @subject
  end
end
