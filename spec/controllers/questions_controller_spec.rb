require "spec_helper"

describe QuestionsController do
  describe "#new" do
    before do
      @person = FactoryGirl.create(:federal_legislator_bernard_sanders)
      @person.write_attribute(:active, true)
      @person.save
    end

    context "when question_skeleton is passed in via session" do
      it "populate question title and body from question_skeleton" do
        question_skeleton = { title: "Blah, blah", body: "yada, yada, yada" }
        session[:question_skeleton] = question_skeleton

        get :new, jurisdiction: @person.state, person: @person

        new_question = assigns(:question)

        expect(new_question.title).to eq question_skeleton[:title]
        expect(new_question.body).to eq question_skeleton[:body]
      end
    end
  end

  describe "#create" do
    before do
      @person = FactoryGirl.create(:federal_legislator_bernard_sanders)
      @person.write_attribute(:active, true)
      @person.save
    end

    context "when referring_partner_in is passed in via session" do
      it "populate question.user with referring_partner_info" do
        question_attributes = { title: "X",
                                body: "Y",
                                person_id: @person.id,
                                user: { email: "test@example.com",
                                        postal_code: "05602" } }

        referring_partner = { name: "Someone Special",
                              url: "http://example.com" }

        session[:referring_partner_info] = referring_partner

        post :create, jurisdiction: @person.state, question: question_attributes

        new_user = assigns(:user)

        expect(new_user.referring_partner_info).to eq referring_partner
      end
    end
  end

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
