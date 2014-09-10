class Candidate < Person
  # useful for finding the current office holder id that candidate opposes
  attr_accessor :current_office_holder_name

  belongs_to :current_office_holder, class_name: "Person", inverse_of: :opponents

  field :party, type: String

  # these are populated by copying fields from current office holder
  field :ocd_division_id, type: String
  field :running_for_position, type: String
end
