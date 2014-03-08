class BlurbsController < InheritedResources::Base
  before_filter :force_http
  before_filter :authenticate_user!
  before_filter :check_manage_blurbs
  before_filter :set_blurb_user, only: :create

  def new
    @target_url = params[:target_url] ||  "/"
    new!
  end

  def edit
    @target_url = params[:target_url] ||  resource.target_url
    edit!
  end

  private
  def set_blurb_user
    params[:blurb][:user] = current_user
  end

  def check_manage_blurbs
    unless current_user.can?(:manage_blurbs)
      raise Authority::SecurityViolation.new(current_user,
                                             :manage_blurbs,
                                             BlurbsController)
    end
  end
end
