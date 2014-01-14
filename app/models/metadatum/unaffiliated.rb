# special case for people that are not known to be elected officials
class Metadatum::Unaffiliated
  ABBREVIATION = "unaffiliated"

  # return Unaffiliated jurisidiction
  def self.find_or_create!
    Metadatum.where(abbreviation: ABBREVIATION).first ||
      create_unaffiliated_metadatum
  end

  def self.create_unaffiliated_metadatum
    attributes = { abbreviation: ABBREVIATION,
      "_id" => "unaffiliated",
      chambers: { "lower" => { "name" => "Unspecified", "title" => "" } },
      name: "Unaffiliated",
      legislature_name: ""
    }

    Metadatum.create! attributes
  end

  private_class_method :create_unaffiliated_metadatum
end
