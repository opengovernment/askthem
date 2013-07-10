# used for populating a new instance of Metadatum
# for 'us' jurisdiction
class Metadatum::Us
  # return US jurisidiction
  def self.find_or_create!
    Metadatum.use('us').where(abbreviation: 'us').first ||
      create_us_metadatum
  end

  private
  def self.create_us_metadatum
    attributes = { abbreviation: 'us',
      chambers: { "upper" => { "name" => "Senate", "title" => "Senator" },
        "lower" => { "name" => "House", "title" => "Representative" } },
      name: "United States",
      legislature_name: "United States Congress"
    }

    Metadatum.with(session: 'openstates').create! attributes
  end
end
