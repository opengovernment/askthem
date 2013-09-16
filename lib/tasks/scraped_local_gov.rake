namespace :scraped_local_gov do
  desc "Import City Council meetings from scraper mongo collection"
  task meetings: :environment do
    Meeting.load_from_apis_for_jurisdiction
  end
end
