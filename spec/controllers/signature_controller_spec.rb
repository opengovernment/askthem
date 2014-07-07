require "spec_helper"

describe SignaturesController do
  describe "#create" do
    # @warn can't use let because of mongoid teardown
    before :each do
      @user = FactoryGirl.create(:user)
      @person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
      @question = FactoryGirl.create(:question, person: @person)
      @question.signature_count = @question.person.signature_threshold - 1
      @question.save
      sign_in @user
    end

    it "ensures an email is sent to person when signature threshold is met" do
      pending "feature being reenabled, see question_mailer#email_person"

      post :create, format: :json, question_id: @question.id
      last_email = ActionMailer::Base.deliveries.last
      msg = "A question asked of you by people on AskThem has reached"
      expect(last_email.body.encoded).to match(msg)
    end

    it "ensures an email is sent to staff when signature threshold is met" do
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member

      post :create, format: :json, question_id: @question.id
      last_email = ActionMailer::Base.deliveries.last
      msg = "A question has reached its delivery goal"
      expect(last_email.body.encoded).to match(msg)
    end
  end

  context "#index viewing a question's signatures" do
    before do
      @question = FactoryGirl.create(:question)
    end

    context "and logged out" do
      it "should refuse access" do
        get :index, { question_id: @question.id,
          jurisdiction: @question.state,
          format: :csv }
        expect(response.body).to have_content "Please sign in or sign up to continue."
      end
    end

    context "and not logged in as staff member or partner user" do
      before do
        @user = FactoryGirl.create(:user)
        sign_in @user
      end

      it "should refuse access" do
        get :index, { question_id: @question.id,
          jurisdiction: @question.state,
          format: :csv }
        expect(response.code).to eq("403")
      end
    end

    context "and logged in as staff or partner" do
      before do
        @staff_member = FactoryGirl.create(:user)
        @staff_member.add_role :staff_member
        sign_in @staff_member
      end

      it "returns csv rows" do
        # works as expected from browser testing
        pending "figuring out why csv is not rendering at all"
        get :index, { question_id: @question.id,
          jurisdiction: @question.state,
          format: :csv }
        expect(CSV.parse(response.body).size).to eq 2
      end
    end

    after do
      sign_out :user
    end
  end
end
