class RobotsController < ApplicationController
  # handles /robots.txt
  def show
    @disallows = disallowed_pages + disallowed_directories + disallowed_actions
  end

  private
  def disallowed_pages
    ["/locator", "/identifier", "/contact_info",
     "/users/sign_in", "/users/sign_up", "/users/edit", "/users/confirmation"]
  end

  def disallowed_directories
    names = %w{identities answers signatures}
    names += ["users/auth", "users/password", "users/confirmation"]
    names.collect { |name| "/#{name}/"}
  end

  def disallowed_actions
    Metadatum.all.inject([]) do |disallowed_actions, metadatum|
      disallowed_actions << "/#{metadatum.id}/questions/new"
    end
  end
end
