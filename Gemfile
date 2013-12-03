# @todo change rubygems to https when cert fixed on appserver
source 'https://rubygems.org'
ruby '1.9.3'

gem 'rails', '3.2.15'
gem 'jquery-rails'

gem 'mongoid', '~> 3.1.2'
gem 'geocoder' # must be after mongoid
gem 'rmagick'
gem 'carrierwave-mongoid'
gem 'client_side_validations'
gem 'client_side_validations-mongoid'
gem 'sidekiq'
gem 'inherited_resources', '~> 1.3.1'
gem 'simple_form'
gem 'kaminari'
gem 'coveralls', require: false

# aka state machine management
gem 'workflow_on_mongoid'

# Authentication
gem 'devise'
gem 'omniauth'
gem 'omniauth-facebook'
gem 'omniauth-gplus'

# Authorization
gem 'authority'
gem 'rolify', '3.3.0.rc4'

# Rake tasks
gem 'ruby-progressbar'
gem 'rest-client'

# Google Civic Information API, used for representatives for address
gem 'google_civic_info', github: 'walter/google_civic_info'

group :production do
  gem 'airbrake'
  gem 'unicorn'
  gem 'fog'
  gem 'newrelic_rpm'
  gem 'capistrano'
  gem 'rvm-capistrano'  # https://rvm.io/integration/capistrano/ and https://github.com/wayneeseguin/rvm-capistrano
end

group :development do
  gem 'ruby-growl', '3.0'
  gem 'bullet'
end

group :test, :development do
  gem 'pry-rails'
  gem 'rspec-rails'
end

group :test do
  gem 'capybara'
  gem 'factory_girl_rails'
  gem 'mongoid-rspec'
  gem 'vcr' # play back external HTTP requests
  gem 'webmock' # stub and mock external HTTP requests
  gem 'poltergeist'
end

group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'
  gem 'compass-rails'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platforms => :ruby

  gem 'uglifier', '>= 1.0.3'
end
