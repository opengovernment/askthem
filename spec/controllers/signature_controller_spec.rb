require "spec_helper"

describe SignaturesController do
  # @warn can't use let because of mongoid teardown
  before :each do
    @user = FactoryGirl.create(:user)
    @person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
    @question = FactoryGirl.create(:question, person: @person)
    @question.signature_count = @question.person.signature_threshold - 1
    @question.save
    sign_in @user
  end

  describe "#create" do
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
end
