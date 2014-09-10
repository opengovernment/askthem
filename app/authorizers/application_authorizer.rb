# Other authorizers should subclass this one
class ApplicationAuthorizer < Authority::Authorizer

  # Any class method from Authority::Authorizer that isn't overridden
  # will call its authorizer's default method.
  #
  # @param [Symbol] adjective; example: `:creatable`
  # @param [Object] user - whatever represents the current user in your app
  # @return [Boolean]
  def self.default(adjective, user)
    # 'Whitelist' strategy for security: anything not explicitly allowed is
    # considered forbidden.
    false
  end

  def self.authorizes_to_view_contact_info?(user)
    user.has_role? :staff_member
  end

  def self.authorizes_to_manage_question?(user)
    user.has_role? :staff_member
  end

  def self.authorizes_to_manage_person?(user)
    user.has_role? :staff_member
  end

  def self.authorizes_to_manage_blurbs?(user)
    user.has_role? :staff_member
  end

  def self.authorizes_to_manage_user?(user)
    user.has_role? :staff_member
  end

  def self.authorizes_to_view_signatures?(user)
    user.has_role? :staff_member
  end

  def self.authorizes_to_manage_candidates?(user)
    user.has_role? :staff_member
  end
end
