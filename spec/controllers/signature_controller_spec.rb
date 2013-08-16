include Devise::TestHelpers

describe SignaturesController do
  # @warn can't use let because of mongoid teardown
  before :each do
    @user = FactoryGirl.create(:user)
    @person = FactoryGirl.create(:person_ny_sheldon_silver)
    @question = FactoryGirl.create(:question, person: @person)
    @question.signature_count = @question.person.signature_threshold - 1
    @question.save
    sign_in @user
  end

  describe "#create" do
    it "ensures that an email is sent to admins when Person email is blank" do
      @person.email = ''
      @person.save
      post :create, format: :json, question_id: @question.id
      last_email = ActionMailer::Base.deliveries.last
      last_email.body.encoded.should match("This email could not be sent because we don't have an email address for")
    end
    it "ensures that an email is sent to person when signature threshold is met" do
      post :create, format: :json, question_id: @question.id
      last_email = ActionMailer::Base.deliveries.last
      last_email.body.encoded.should match("A question asked of you by people on AskThem has reached")
    end
  end
end
