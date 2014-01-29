class SessionsController < Devise::SessionsController
  force_ssl if Rails.env.production?

  layout 'data_collection'
end
