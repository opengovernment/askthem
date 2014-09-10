require "spec_helper"

describe ApplicationAuthorizer do
  context "class" do
    it "lets staff member read contact_info" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:view_contact_info)).to be_true
    end

    it "lets staff member manage question" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:manage_question)).to be_true
    end

    it "does not let normal users manage question" do
      user = FactoryGirl.create(:user)
      expect(user.can?(:manage_question)).to be_false
    end

    it "lets staff member manage people" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:manage_person)).to be_true
    end

    it "does not let normal users manage question" do
      user = FactoryGirl.create(:user)
      expect(user.can?(:manage_person)).to be_false
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

    it "lets staff member manage user" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:manage_user)).to be_true
    end

    it "does not let normal users manage user" do
      user = FactoryGirl.create(:user)
      expect(user.can?(:manage_user)).to be_false
    end

    it "lets staff member view signatures" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:view_signatures)).to be_true
    end

    it "does not let normal users view signatures" do
      user = FactoryGirl.create(:user)
      expect(user.can?(:view_signatures)).to be_false
    end

    it "lets staff member manage candidates" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      expect(staff_member.can?(:manage_candidates)).to be_true
    end

    it "does not let normal users manage candidates" do
      user = FactoryGirl.create(:user)
      expect(user.can?(:manage_candidates)).to be_false
    end
  end
end
