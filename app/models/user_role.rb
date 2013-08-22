# rolify role model
# we use UserRole to avoid name collision with person.roles
class UserRole
  include Mongoid::Document
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

  private
  def global_role?
    resource_type.blank? && resource_field.blank? & resource_id.blank?
  end
end
