namespace :governors do
  desc "Import governors from DemocracyMap"
  task load: :environment do
    Governor.load_governors
  end
end
