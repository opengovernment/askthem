namespace :seed_cities do
  desc "Import City Council metadata and member for seed cities"
  task load: :environment do
    Metadatum::SeedCities.find_or_create!

    # HACK - relying on these files is brittle, a temporary measure
    Metadatum::SeedCities::ABBREVIATIONS.each do |abbreviation|
      json = File.read("#{Rails.root}/data_dumps/#{abbreviation}.json")
      councilmembers = JSON.parse(json)
      councilmembers.each do |attributes|
        Councilmember.create! attributes.merge({ active: true,
                                                 state: abbreviation })
      end
    end
  end
end
