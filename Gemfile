source 'https://rubygems.org'
ruby '1.9.3'

gem 'rails', '3.2.13'
gem 'jquery-rails'

gem 'mongoid', '~> 3.1.2'
gem 'geocoder' # must be after mongoid
gem 'rmagick'
gem 'carrierwave-mongoid'
gem 'client_side_validations'
gem 'client_side_validations-mongoid'
gem 'resque'
gem 'inherited_resources', '~> 1.3.1'
gem 'simple_form'
gem 'kaminari'
gem 'coveralls', require: false

# Authentication
gem 'devise'
gem 'omniauth'
gem 'omniauth-facebook'
gem 'omniauth-gplus'

# Rake tasks
gem 'ruby-progressbar'
gem 'rest-client'

group :production do
  gem 'airbrake'
  gem 'unicorn'
  gem 'fog'
  gem 'newrelic_rpm'
end

group :development do
  gem 'heroku' # Rake task
  gem 'ruby-growl', '3.0'
  gem 'bullet'
end

group :test, :development do
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
