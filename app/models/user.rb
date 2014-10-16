class User
  include Mongoid::Document
  include Mongoid::Timestamps

  # authorization based on roles
  rolify role_cname: 'UserRole'
  include Authority::UserAbilities

  # Devise

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  # devise :database_authenticatable, :registerable,
  #        :recoverable, :rememberable, :trackable, :validatable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable,
    :omniauthable, :omniauth_providers => [:facebook]

  ## Database authenticatable
  field :email,              :type => String, :default => ""
  field :encrypted_password, :type => String, :default => ""

  ## Recoverable
  field :reset_password_token,   :type => String
  field :reset_password_sent_at, :type => Time

  # in some cases we allow sign up without password
  # and prompt user to reset password
  field :password_is_placeholder, type: Boolean, default: false

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

  # mappings to a person in our db
  # potential more than one as we may have the same person
  # listed more than once in our db if they have held more than one office
  has_many :identities, inverse_of: :user, dependent: :destroy

  # users that are staff members can verify or reject an identity
  has_many :inspections, class_name: "Identity", inverse_of: :inspector

  has_many :questions, dependent: :destroy
  has_many :signatures, dependent: :destroy
  has_many :answers, dependent: :destroy
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
  field :local_jurisdiction_abbreviation, type: String

  # is this partner organization
  # that we may share signature data with?
  field :partner, type: Boolean, default: false

  # or is this user referred by a partner (rather a partner org itself)
  # name, url are basic subfields
  field :referring_partner_info, type: Hash

  index('authentications.provider' => 1, 'authentications.uid' => 1)

  validates_presence_of :given_name, :family_name, :email
  validates_presence_of :postal_code, :country
  validates_inclusion_of :region, in: OpenGovernment::STATES.values, allow_blank: true
  validates_inclusion_of :country, in: %w(US), allow_blank: true

  attr_accessor :for_new_question
  validates_presence_of :locality, if: :for_new_question?

  before_validation :set_password_confirmation

  after_create :trigger_geocoding
  after_create :send_reset_password_if_password_is_placeholder
  after_create :set_local_jurisdiction_abbreviation

  # Called by RegistrationsController.
  def self.new_with_session(params, session)
    super.tap do |user|
      data = session['devise.facebook_data']
      if data
        user.email = data['info']['email'] if user.email.blank?
        user.given_name ||= data['info']['first_name']
        user.family_name ||= data['info']['last_name']
        user.remote_image_url ||= data['info']['image']
        user.authentications.build(data.slice('provider', 'uid'))
        # `data['info']['location']` isn't reliably a locality or region.
      end
    end
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

  # @return [Boolean] a given question has been signed by the user
  def question_signed?(question_id)
    questions_signed.map(&:id).include? question_id
  end

  def top_issues
    questions.map { |q| q.subject }.uniq.compact.sort
  end

  # @return [String] the user's address for geocoding
  def address_for_geocoding
    [street_address, locality, region, country, postal_code] * ', '
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

  def verified?
    identities.where(status: "verified").count > 0
  end

  # conditional validation for when we need all fields filled out
  # i.e. questions/new action relies on api lookup that needs full address
  # but registering when signature adding does not
  def for_new_question
    @for_new_question ||= false
  end

  alias_method :for_new_question?, :for_new_question

  def local_jurisdiction
    Metadatum.where(id: local_jurisdiction_abbreviation).first
  end

  def update_address_from_string(address_string)
    location = LocationFormatter.new(address_string).format

    self.street_address = location.street_address
    self.locality = location.city
    self.region = location.state_code.downcase
    self.country = location.country_code
    self.postal_code = location.postal_code
    self.coordinates = location.coordinates.reverse
  end

  def set_attributes_based_on_partner
    return unless referring_partner_info.present?
    return if persisted?

    self.password = Devise.friendly_token.first(6)
    self.password_is_placeholder = true

    self.given_name = email.split("@").first if email
    if referring_partner_info[:name].present?
      self.family_name = "from #{referring_partner_info[:name]}"
    else
      self.family_name = "no last name given"
    end

    if referring_partner_info[:submitted_address].present?
      update_address_from_string(referring_partner_info[:submitted_address])
    end
  end

  private
  # Unlike Devise, doesn't require password confirmations.
  def set_password_confirmation
    self.password_confirmation = password
  end

  def trigger_geocoding
    GeocodeWorker.perform_async(id.to_s) unless coordinates.present?
  end

  def send_reset_password_if_password_is_placeholder
    if password_is_placeholder?
      UserSetPasswordNoticeWorker.perform_in(10.minutes, id.to_s)
    end
  end

  def set_local_jurisdiction_abbreviation
    UserSetLocalJurisdictionAbbreviationWorker.perform_in(2.minutes, id.to_s)
  end
end
