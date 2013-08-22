require 'spec_helper'

describe UserRole do
  context "when global role" do
    it "has unique name" do
      UserRole.create!(name: 'staff_member')
      expect(UserRole.new(name: 'staff_member').valid?).to be_false
    end
  end
end
