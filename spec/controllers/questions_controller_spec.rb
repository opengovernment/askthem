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

  describe "#create", vcr: true do
    before do
      @person = FactoryGirl.create(:federal_legislator_bernard_sanders)
      @person.write_attribute(:active, true)
      @person.save
    end

    context "when referring_partner_info is passed" do
      let(:question_attributes) { { title: "XXX",
          body: "Y",
          person_id: @person.id,
          user: { email: "bernice@example.com" } } }

      let(:referring_partner) { { name: "Someone Special",
          url: "http://example.com",
          submitted_address: '05602' } }

      context "via session" do
        it "populate question.user with referring_partner_info" do
          session[:referring_partner_info] = referring_partner

          post :create, jurisdiction: @person.state, question: question_attributes

          new_user = assigns(:user)

          expect(new_user.referring_partner_info).to eq referring_partner
        end

        it "populate question.user with attributes based on partner" do
          session[:referring_partner_info] = referring_partner

          post :create, jurisdiction: @person.state, question: question_attributes

          new_user = assigns(:user)

          expect(new_user.given_name).to eq "bernice"
          expect(new_user.family_name).to eq "from Someone Special"
          expect(new_user.password).to_not be_nil
          expect(new_user.password_is_placeholder?).to be_true
        end
      end

      context "via partner in params" do
        it "populate question.user with referring_partner_info" do
          post(:create,
               jurisdiction: @person.state,
               question: question_attributes,
               partner: referring_partner)

          new_user = assigns(:user)

          expect(new_user.referring_partner_info)
            .to eq referring_partner.with_indifferent_access
        end

        it "populate question.user with attributes based on partner" do
          post(:create,
               jurisdiction: @person.state,
               question: question_attributes,
               partner: referring_partner)

          new_user = assigns(:user)

          expect(new_user.given_name).to eq "bernice"
          expect(new_user.family_name).to eq "from Someone Special"
          expect(new_user.password).to_not be_nil
          expect(new_user.password_is_placeholder?).to be_true
        end

        context "and the format is json" do
          let(:request_headers) { {
              "Accept" => "application/json",
              "Content-Type" => "application/json"
            }
          }

          let(:json_params) { {
              jurisdiction: @person.state,
              question: question_attributes,
              partner: referring_partner,
              format: :json
            }
          }

          it "if valid, it populates question, user, and person correctly" do
            post :create, json_params, request_headers

            new_user = assigns(:user)

            expect(Question.last.title).to eq json_params[:question][:title]
            expect(Question.last.person_id)
              .to eq json_params[:question][:person_id]
            expect(new_user.referring_partner_info)
              .to eq referring_partner.with_indifferent_access
          end

          it "if invalid, it returns errors in json" do
            invalid_json_params = json_params
            invalid_json_params[:question][:title] = "X"

            post :create, json_params, request_headers

            json = JSON.parse(response.body)

            expect(json["title"].first.include?("is too short")).to be_true
            expect(response.code).to eq("422")
          end
        end
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
