# Billy
class Person
  include Mongoid::Document
  store_in collection: 'legislators'

  # Non-Billy
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

  def questions # @todo
    []
  end

  def answers # @todo
    []
  end
end
