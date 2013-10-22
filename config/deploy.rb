require 'bundler/capistrano'   # http://gembundler.com/v1.3/deploying.html
require 'rvm/capistrano'       # https://rubygems.org/gems/rvm-capistrano
set :rvm_type, :system

set :application,   "askthem"
set :user,          "cappy"
set :repository,    "https://github.com/rchekaluk/opengovernment-app.git"
set :keep_releases, 4

default_run_options[:pty] = true
set :scm,         :git

# if you want to clean up old releases on each deploy uncomment this:
after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end

