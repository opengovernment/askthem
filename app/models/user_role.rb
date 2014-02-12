# rolify role model
# we use UserRole to avoid name collision with person.roles
class UserRole
  include Mongoid::Document
  include Mongoid::Timestamps

  has_and_belongs_to_many :users
  belongs_to :resource, :polymorphic => true

  field :name, :type => String

  validates :name, uniqueness: true, if: :global_role?

  index({ name: 1,
          resource_type: 1,
          resource_id:1
        },
        { unique: true})

  scopify

  def self.staff_members
    staff_member_role = where(name: "staff_member").first
    return [] unless staff_member_role

    staff_member_role.users
  end

  private
  def global_role?
    resource_type.blank? && resource_field.blank? & resource_id.blank?
  end
end
