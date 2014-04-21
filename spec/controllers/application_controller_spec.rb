require "spec_helper"

describe ApplicationController do
  describe "#staff_member?" do
    context "when not a signed in user" do
      it "returns false" do
        expect(controller.staff_member?).to be_false
      end
    end

    context "when a signed in user" do
      before :each do
        @user = FactoryGirl.create(:user)
        sign_in @user
      end

      it "returns false when does not have staff member role" do
        expect(controller.staff_member?).to be_false
      end

      context "when user has staff_member role" do
        before do
          @user.add_role :staff_member
        end

        it "returns true" do
          expect(controller.staff_member?).to be_true
        end
      end
    end
  end
end
