source 'https://rubygems.org'
ruby '1.9.3'

gem 'rails', '3.2.12'
gem 'jquery-rails'

gem 'mongoid', '~> 3.1.2'
gem 'rmagick'
gem 'carrierwave-mongoid'
gem 'inherited_resources', '~> 1.3.1'
gem 'simple_form'
gem 'kaminari'

# Authentication
gem 'devise'
gem 'omniauth'
gem 'omniauth-facebook'
gem 'omniauth-gplus'

# Rake tasks
gem 'ruby-progressbar'
gem 'rest-client'

group :production do
  gem 'unicorn'
  gem 'newrelic_rpm'
end

group :development do
  gem 'heroku' # Rake task
  gem 'ruby-growl', '3.0'
  gem 'bullet'
end

group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'
  gem 'compass-rails'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platforms => :ruby

  gem 'uglifier', '>= 1.0.3'
end
