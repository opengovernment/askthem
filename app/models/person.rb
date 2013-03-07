# Billy
class Person
  include Mongoid::Document
  store_in collection: 'legislators'

  # For sorting on people#index.
  index(chamber: 1, last_name: 1)

  # Stores Popolo fields that are not available in Billy.
  has_one :person_detail, autobuild: true

  field :full_name, type: String, as: :name
  field :leg_id, type: String, as: :slug
  field :last_name, type: String, as: :family_name
  field :first_name, type: String, as: :given_name
  field :middle_name, type: String, as: :additional_name
  field '+title', type: String, as: :honorific_prefix
  field :suffixes, type: String, as: :honorific_suffix
  field :email, type: String
  field '+gender', type: String, as: :gender
  field :photo_url, type: String, as: :image

  # Returns the person's sponsored bills.
  def bills
    Bill.where('sponsors.leg_id' => id)
  end

  # Returns the person's committees.
  def committees
    ids = read_attribute(:roles).map{|x| x['committee_id']}.compact
    if ids.empty?
      []
    else
      Committee.where(_id: {'$in' => ids}).to_a
    end
  end

  # Returns the person's votes.
  def votes
    Vote.where(_voters: id)
  end

  def questions # @todo
    []
  end

  def answers # @todo
    []
  end
end
