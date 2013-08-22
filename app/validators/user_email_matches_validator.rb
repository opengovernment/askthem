class UserEmailMatchesValidator < ActiveModel::Validator
  def validate(record)
    unless record.user.email.downcase == record.person.email.downcase
      record.errors[:base] << "Email addresses must match"
    end
  end
end
