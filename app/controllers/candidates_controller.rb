class CandidatesController < ApplicationController
  before_filter :force_http

  inherit_resources
  belongs_to :jurisdiction, parent_class: Metadatum, finder: :find_by_abbreviation, param: :jurisdiction

  before_filter :authenticate_user!
  before_filter :check_can_manage_candidates

  def new
    new! do
      if params[:twitter_id]
        screen_name = params[:twitter_id]
        twitter_api = TwitterPersonService.new(screen_name, false)
        match = twitter_api.client.users(screen_name).first
        TwitterPersonAdapter.new(@candidate).run(match)
      end

      if params[:current_office_holder_name]
        matches = Person.active
                  .connected_to(parent.abbreviation)
                  .some_name_matches(params[:current_office_holder_name])

        if matches.any?
          in_office = matches.first
          @candidate.ocd_division_id = in_office.read_attribute(:ocd_division_id)
          @candidate.current_office_holder_name = in_office.full_name
          @candidate.current_office_holder = in_office
          @candidate.running_for_position = in_office.political_position_title
        end
      end
    end
  end

  def edit
    edit! do
      @candidate.current_office_holder_name = @candidate.current_office_holder.full_name
    end
  end

  def create
    create! { candidates_path parent }
  end

  private
  def check_can_manage_candidates
    unless current_user.can?(:manage_candidates)
      raise Authority::SecurityViolation.new(current_user,
                                             :manage_candidates,
                                             CandidatesController)
    end
  end

  def end_of_association_chain
    Candidate.connected_to(parent.abbreviation)
  end
end
