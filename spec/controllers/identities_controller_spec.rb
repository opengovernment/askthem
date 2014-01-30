require "spec_helper"

describe IdentitiesController do
  # @warn can't use let because of mongoid teardown
  before { @identity = FactoryGirl.create(:identity) }

  describe "#update" do
    context "when not signed in" do
      it "cannot make changes" do
        post :update, id: @identity.id
        expect(response.body).to redirect_to("/users/sign_in")
      end
    end

    context "when not staff member" do
      it "cannot make changes" do
        user = FactoryGirl.create(:user)
        sign_in user

        post :update, id: @identity.id
        expect(response.code).to eq("403")
      end
    end

    context "when logged in as staff member" do
      context "takes the event" do
        before do
          @staff_member = FactoryGirl.create(:user)
          @staff_member.add_role :staff_member
          sign_in @staff_member

          @identity.status = "being_inspected"
          @identity.save
        end

        it "verify! and changes identity state accordingly" do
          post :update, id: @identity.id, event: "verify!"
          expect(@identity.reload.verified?).to be_true
        end

        it "reject! and changes identity state accordingly" do
          post :update, id: @identity.id, event: "reject!"
          expect(@identity.reload.rejected?).to be_true
        end
      end
    end

    after do
      sign_out :user
    end
  end
end
