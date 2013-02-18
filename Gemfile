source 'https://rubygems.org'

gem 'rails', '3.2.11'
gem 'jquery-rails'

gem 'mongoid', '~> 3.0.17'
gem 'inherited_resources', '~> 1.3.1'
gem 'unicorn'

group :production do
  gem 'newrelic_rpm'
end

group :test, :development do
  gem 'heroku' # Rake task
end

group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'
  gem 'compass-rails'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platforms => :ruby

  gem 'uglifier', '>= 1.0.3'
end
