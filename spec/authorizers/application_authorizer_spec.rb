require "spec_helper"

describe ApplicationAuthorizer do
  context "class" do
    it "lets staff member read contact_info" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:view_contact_info)).to be_true
    end

    it "lets staff member destroy question" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:destroy_question)).to be_true
    end

    it "does not let normal users destroy question" do
      user = FactoryGirl.create(:user)
      expect(user.can?(:destroy_question)).to be_false
    end

    it "lets staff member manage blurbs" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:manage_blurbs)).to be_true
    end

    it "does not let normal users manage blurbs" do
      user = FactoryGirl.create(:user)
      expect(user.can?(:manage_blurbs)).to be_false
    end
  end
end
