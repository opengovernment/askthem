class IdentityAuthorizer < ApplicationAuthorizer
  # Class method: all users can create identities
  def self.creatable_by?(user)
    true
  end

  # only staff members can verify or reject an identity
  def updatable_by?(user)
    user.has_role? :staff_member
  end
end
