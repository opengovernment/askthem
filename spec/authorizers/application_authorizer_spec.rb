require "spec_helper"

describe ApplicationAuthorizer do
  context "class" do
    it "lets staff member read" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:view_contact_info)).to be_true
    end
  end
end
