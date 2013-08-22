require 'spec_helper'

describe Role do
  context "when global role" do
    it "has unique name" do
      Role.create!(name: 'staff_member')
      expect(Role.new(name: 'staff_member').valid?).to be_false
    end
  end
end
