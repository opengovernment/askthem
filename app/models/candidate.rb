class Candidate < Person
  # useful for finding the current office holder id that candidate opposes
  attr_accessor :current_office_holder_name

  belongs_to :current_office_holder, class_name: "Person", inverse_of: :opponents

  field :party, type: String

  # these are populated by copying fields from current office holder
  field :ocd_division_id, type: String
  field :running_for_position, type: String

  # for now, returns no results
  def self.for_location(location)
    location = LocationFormatter.new(location).format
    return where(id: [])
  end

  def political_position_title
    "Candidate for #{metadatum.read_attribute(:name)} #{running_for_position}"
  end
end
