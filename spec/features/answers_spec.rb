require "spec_helper"
require File.expand_path("../features_helper.rb", __FILE__)

describe "question" do
  before :each do
    @user = FactoryGirl.create(:user)
    @metadatum = Metadatum.create(name: "New York",
                                  abbreviation: "ny",
                                  chambers: {} )
    @person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
    @question = FactoryGirl.create(:question,
                                   state: @metadatum.abbreviation,
                                   person: @person)
    identity = FactoryGirl.create(:identity)
    identity.status = "being_inspected"
    identity.verify! @user
    @verified_user = User.find(identity.user_id)
  end

  describe "#show" do
    context "when signed in as responder" do

      it "allows that user to respond to the question" do
        as_user @verified_user do
          visit "/ny/questions/#{@question.id}"
          find(".btn.cta-pill").value.should eq "Submit Answer"
        end
      end

      it "displays the answer" do
        as_user @verified_user do
          Sidekiq::Testing.disable! do
            visit "/ny/questions/#{@question.id}"
            within ".answer" do
              fill_in "answer[text]", :with => "Very interesting question, let me think about it."
              click_button "Submit Answer"
            end
            page.body.should have_content "Very interesting question, let me think about it."
          end
        end
      end
    end
  end
end
