task cron: :environment do
  Rake::Task['openstates:update'].invoke
end
