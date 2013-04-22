class Authentication
  include Mongoid::Document
  include Mongoid::Timestamps

  embedded_in :user

  field :provider, type: String
  field :uid, type: String

  validates_presence_of :provider, :uid
  validates_inclusion_of :provider, in: %w(facebook), allow_blank: true
  validates_uniqueness_of :provider
end
