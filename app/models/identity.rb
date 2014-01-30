class Identity
  class InvalidWorkflowEvent < StandardError; end

  include Mongoid::Document
  include Workflow

  # authorization based on roles
  # adds updatable_by?(user) for staff_members to inspect identities, etc.
  include Authority::Abilities

  include ActiveModel::Validations
  validates_with UserEmailMatchesValidator

  belongs_to :user, inverse_of: :identities
  belongs_to :person
  belongs_to :inspector, class_name: "User", inverse_of: :inspections

  field :inspected_at, type: ActiveSupport::TimeWithZone
  field :status

  workflow_column :status

  workflow do
    # we use separate states for new and being_inspected
    # so we can fire separate events/notifications
    state :new do
      event :submit, transitions_to: :being_inspected
    end

    state :being_inspected do
      event :verify, transitions_to: :verified
      event :reject, transitions_to: :rejected
    end

    state :verified
    state :rejected
  end

  def inspection_event(event, inspector)
    unless current_state.events.keys.include?(event.sub("!", "").to_sym)
      raise InvalidWorkflowEvent, "#{event} is not accepted"
    end

    send event, inspector
  end

  private
  # workflow methods for their corresponding events
  def submit
    IdentityMailer.identity_submitted(self).deliver

    UserRole.staff_members.each do |staff_member|
      IdentityMailer.identity_needs_inspection(self, staff_member).deliver
    end
  end

  def verify(inspector)
    # grant user responder role for person so they can answer questions
    user.add_role :responder, person

    record_inspection! inspector
    IdentityMailer.identity_verified(self).deliver
  end

  def reject(inspector)
    record_inspection! inspector
    IdentityMailer.identity_rejected(self).deliver
  end

  def record_inspection!(user)
    self.inspector = user
    self.inspected_at = Time.zone.now
  end
end
