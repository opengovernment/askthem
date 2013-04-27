class User
  include Mongoid::Document
  store_in session: 'default' # @see https://github.com/mongoid/mongoid/pull/2909

  # Devise

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  # devise :database_authenticatable, :registerable,
  #        :recoverable, :rememberable, :trackable, :validatable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable,
    :confirmable, :omniauthable, :omniauth_providers => [:facebook]

  ## Database authenticatable
  field :email,              :type => String, :default => ""
  field :encrypted_password, :type => String, :default => ""

  ## Recoverable
  field :reset_password_token,   :type => String
  field :reset_password_sent_at, :type => Time

  ## Rememberable
  field :remember_created_at, :type => Time

  ## Trackable
  field :sign_in_count,      :type => Integer, :default => 0
  field :current_sign_in_at, :type => Time
  field :last_sign_in_at,    :type => Time
  field :current_sign_in_ip, :type => String
  field :last_sign_in_ip,    :type => String

  ## Confirmable
  # field :confirmation_token,   :type => String
  # field :confirmed_at,         :type => Time
  # field :confirmation_sent_at, :type => Time
  # field :unconfirmed_email,    :type => String # Only if using reconfirmable
  field :confirmation_token,   :type => String
  field :confirmed_at,         :type => Time
  field :confirmation_sent_at, :type => Time

  ## Lockable
  # field :failed_attempts, :type => Integer, :default => 0 # Only if lock strategy is :failed_attempts
  # field :unlock_token,    :type => String # Only if unlock strategy is :email or :both
  # field :locked_at,       :type => Time

  ## Token authenticatable
  # field :authentication_token, :type => String

  # Non-Devise

  include Geocoder::Model::Mongoid
  geocoded_by :address_for_geocoding

  embeds_many :authentications
  has_many :questions
  has_many :signatures
  mount_uploader :image, ImageUploader

  field :coordinates, type: Array

  # Based on Popolo.
  field :given_name, type: String
  field :family_name, type: String

  # Based on vCard.
  field :street_address, type: String
  field :locality, type: String
  field :region, type: String
  field :postal_code, type: String
  field :country, type: String, default: 'US'

  index('authentications.provider' => 1, 'authentications.uid' => 1)

  validates_presence_of :given_name, :family_name
  validates_presence_of :street_address, :locality, :region, :postal_code, :country
  validates_inclusion_of :region, in: OpenGovernment::STATES.values, allow_blank: true
  validates_inclusion_of :country, in: %w(US), allow_blank: true

  before_validation :set_password_confirmation

  # @todo Check what Devise wiki says.
  def self.find_or_create_from_auth_hash(hash)
    where('authentications.provider' => hash[:provider], 'authentications.uid' => hash[:uid]).first
  end

  # @return [String] the user's formatted name
  def name
    "#{given_name} #{family_name}"
  end

  # @return [String] the user's persisted given name
  def alternate_name
    given_name_was # avoid updating the navigation if there are arrors on the object
  end

  # @return [Array<Question>] questions signed by the user
  def questions_signed
    Question.find(signatures.map(&:question_id))
  end

  # @return [String] the user's address for geocoding
  def address_for_geocoding
    [street_address, locality, region, country, postal_code] * ', '
  end

  @queue = :user_geocode
  def self.perform(id, meth)
    user = find(id) # will raise an error if not found
    case meth.to_s
    when 'geocode'
      user.geocode
      user.save
    end
  end

  # Unlike Devise, allows changing the password without a password.
  # @see https://github.com/plataformatec/devise/blob/master/lib/devise/models/database_authenticatable.rb#L89
  # @see https://github.com/plataformatec/devise/blob/master/lib/devise/models/database_authenticatable.rb#L59
  def update_without_password(params, *options)
    params.delete(:password) if params[:password].blank?
    result = update_attributes(params, *options)
    clean_up_passwords
    result
  end

  # Unlike Devise, allows updating a user without a password.
  alias_method :update_with_password, :update_without_password

private

  # Unlike Devise, doesn't require password confirmations.
  def set_password_confirmation
    self.password_confirmation = password
  end
end
