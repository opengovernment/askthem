require 'spec_helper'
require File.expand_path("../features_helper.rb", __FILE__)

describe "users" do
  # aka a user's profile
  describe '#show' do
    context "has pending identity to be inspected" do
      let(:identity) { FactoryGirl.create(:identity, status: "being_inspected") }
      let(:user) { identity.user }

      context "when not signed in" do
        it "does not show verify and reject buttons" do
          visit "/users/#{user.id}"
          page.should_not have_content "Verify"
          page.should_not have_content "Reject"
        end
      end

      context "when the user has no questions" do
        it "returns none found" do
          visit "/users/#{user.id}"
          page.should have_content "User hasn't asked any questions yet"
        end
      end

      context "when the user has questions" do
        it "returns them" do
          FactoryGirl.create(:question, user: user)
          visit "/users/#{user.id}"
          page.should have_selector ".question_content"
        end
      end

      context "when the user has no signatures" do
        it "returns none found" do
          visit "/users/#{user.id}/signatures"
          page.should have_content "User hasn't signed on to any questions yet"
        end
      end

      context "when the user has signatures" do
        it "returns them" do
          @question = FactoryGirl.create(:question)
          FactoryGirl.create(:signature, user: user, question: @question)

          visit "/users/#{user.id}/signatures"
          page.should have_selector ".question_content"
        end
      end

      context "as a staff member" do
        before :each do
          @staff_member = FactoryGirl.create(:user)
          @staff_member.add_role :staff_member
        end

        it "can click verify and user is verified" do
          as_user(@staff_member) do
            visit "/users/#{user.id}"
            click_button "Verify"
            page.should have_selector ".is-verified"
          end
        end

        it "can click reject and user is rejected" do
          as_user(@staff_member) do
            visit "/users/#{user.id}"
            click_button "Reject"
            page.should have_content 'Rejected'
          end
        end
      end
    end
  end
end
