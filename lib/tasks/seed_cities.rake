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
  desc "Import City Council metadata and members for a specific seed city"
  task load_city: :environment do
    city= ENV["CITY"]

    unless Metadatum::SeedCities::ABBREVIATIONS.include?(city)
      raise "CITY variable is missing or is not a seed city"
    end

    Metadatum::SeedCities.find_or_create_city! city

    # HACK - relying on these files is brittle, a temporary measure
    json = File.read("#{Rails.root}/data_dumps/#{city}.json")
    councilmembers = JSON.parse(json)
    councilmembers.each do |attributes|
      Councilmember.create! attributes.merge({ active: true,
                                               state: city })
    end
  end
end
