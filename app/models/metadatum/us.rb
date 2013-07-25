# used for populating a new instance of Metadatum
# for 'us' jurisdiction
class Metadatum::Us
  ABBREVIATION = 'us'

  # return US jurisidiction
  def self.find_or_create!
    Metadatum.use(ABBREVIATION).where(abbreviation: ABBREVIATION).first ||
      create_us_metadatum
  end

  def self.create_us_metadatum
    attributes = { abbreviation: ABBREVIATION,
      chambers: { "upper" => { "name" => "Senate", "title" => "Senator" },
        "lower" => { "name" => "House", "title" => "Representative" } },
      name: "United States",
      legislature_name: "United States Congress"
    }

    Metadatum.with(session: 'openstates').create! attributes
  end

  private_class_method :create_us_metadatum
end
