class Signature
  include Mongoid::Document
  include Mongoid::Timestamps
  store_in session: 'default' # @see https://github.com/mongoid/mongoid/pull/2909

  belongs_to :user
  belongs_to :question

  # Copy fields from user which may change over time.
  field :given_name, type: String
  field :family_name, type: String
  field :street_address, type: String
  field :locality, type: String
  field :region, type: String
  field :postal_code, type: String
  field :country, type: String, default: 'US'

  validates_presence_of :user_id, :question_id
  validates_uniqueness_of :user_id, scope: :question_id

  before_save :copy_user_fields

private

  def copy_user_fields
    self.given_name     = user.given_name
    self.family_name    = user.family_name
    self.street_address = user.street_address
    self.locality       = user.locality
    self.region         = user.region
    self.postal_code    = user.postal_code
    self.country        = user.country
  end
end
