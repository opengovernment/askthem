#!/usr/bin/env rake
# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.
require 'rspec-rerun'

require File.expand_path('../config/application', __FILE__)

OpenGovernment::Application.load_tasks

task :ci => "rspec-rerun:spec"
