require "spec_helper"

describe IdentityAuthorizer do
  context "class" do
    it "lets anyone create" do
      expect(IdentityAuthorizer).to be_creatable_by(User.new)
    end
  end

  context "instances" do
    let(:identity) { FactoryGirl.create(:identity) }

    it "forbids non-staff from updating" do
      expect(identity.authorizer).not_to be_updatable_by(identity.user)
    end

    it "lets staff members update with results of inspection" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(identity.authorizer).to be_updatable_by(staff_member)
    end
  end
end
