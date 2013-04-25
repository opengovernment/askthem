class User
  include Mongoid::Document
  store_in session: 'default'

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
    :trackable, :validatable, :confirmable, :omniauthable,
    :omniauth_providers => [:facebook]

  ## Database authenticatable
  field :email,              :type => String, :default => ""
  field :encrypted_password, :type => String, :default => ""

  validates_presence_of :email
  validates_presence_of :encrypted_password
  
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
  field :confirmation_token,   :type => String
  field :confirmed_at,         :type => Time
  field :confirmation_sent_at, :type => Time
  field :unconfirmed_email,    :type => String # Only if using reconfirmable

  ## Lockable
  # field :failed_attempts, :type => Integer, :default => 0 # Only if lock strategy is :failed_attempts
  # field :unlock_token,    :type => String # Only if unlock strategy is :email or :both
  # field :locked_at,       :type => Time

  ## Token authenticatable
  # field :authentication_token, :type => String

  include Geocoder::Model::Mongoid
  geocoded_by :address

  embeds_many :authentications
  has_many :questions
  has_many :signatures
  mount_uploader :image, ImageUploader

  field :given_name, type: String
  field :family_name, type: String
  # @note The following are vCard terms.
  field :street_address, type: String
  field :locality, type: String
  field :region, type: String
  field :postal_code, type: String
  field :country, type: String, default: 'US'
  field :coordinates, type: Array

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

  def name
    "#{given_name} #{family_name}"
  end

  def alternate_name
    given_name_was # avoid updating the navigation if there are arrors on the object
  end

  def address
    [street_address, locality, region, country, postal_code] * ', '
  end

  def questions_signed
    Question.find(signatures.map(&:question_id))
  end

  def self.perform(id, meth)
    user = self.class.find(id) # will raise an error if not found
    case meth
    when 'geocode'
      user.geocode
    end
  end

  # @note Unlike Devise, allows changing the password without a password.
  def update_without_password(params, *options)
    params.delete(:password) if params[:password].blank?
    result = update_attributes(params, *options)
    clean_up_passwords
    result
  end

  # @note Unlike Devise, allows updating a user without a password.
  alias_method :update_with_password, :update_without_password

private

  # @note Unlike Devise, do not require password confirmations.
  def set_password_confirmation
    self.password_confirmation = password
  end
end
