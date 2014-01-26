require "spec_helper"

describe QuestionsController do
  context "when requesting to destroy a question" do
    before do
      @person = FactoryGirl.create(:federal_legislator_bernard_sanders)
      @question = FactoryGirl.create(:question,
                                     person: @person,
                                     state: @person.state)
    end

    context "and logged out" do
      it "should refuse access" do
        delete :destroy, id: @question.id, jurisdiction: @question.state
        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context "and not logged in as staff member" do
      before do
        @user = FactoryGirl.create(:user)
        sign_in @user
      end

      it "should refuse access" do
        delete :destroy, id: @question.id, jurisdiction: @question.state
        expect(response.code).to eq("403")
      end

      after do
        sign_out :user
      end
    end

    context "and logged in as staff member" do
      before do
        @staff_member = FactoryGirl.create(:user)
        @staff_member.add_role :staff_member
        sign_in @staff_member
      end

      it "destroys question" do
        delete :destroy, id: @question.id, jurisdiction: @question.state
        expect { @question.reload }.to raise_error Mongoid::Errors::DocumentNotFound
      end

      after do
        sign_out :staff_member
      end
    end
  end
end
