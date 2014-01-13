require "spec_helper"

describe UserRole do
  context "when global role" do
    it "has unique name" do
      UserRole.create!(name: "staff_member")
      expect(UserRole.new(name: "staff_member").valid?).to be_false
    end
  end

  describe ".staff_members" do
    context "when no staff_member role exists" do
      it "returns an empty collection" do
        expect(UserRole.staff_members).to eq Array.new
      end
    end

    it "returns users that are staff members" do
      UserRole.create!(name: "staff_member")
      user = FactoryGirl.create(:user)
      user.add_role :staff_member

      expect(UserRole.staff_members).to eq [user]
    end
  end
end
