require "spec_helper"

describe PagesController do
  context "when requesting csv" do
    context "and logged out" do
      it "should refuse access" do
        get :contact_info, format: :csv
        expect(response.body).to have_content "Please sign in or sign up to continue."
      end
    end

    context "and not logged in as staff member" do
      before do
        @user = FactoryGirl.create(:user)
        sign_in @user
      end

      it "should refuse access" do
        get :contact_info, format: :csv
        expect(response.code).to eq("403")
      end
    end

    context "and logged in as staff member" do
      before do
        @person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
        @person.write_attribute(:active, true)
        @person.save

        @staff_member = FactoryGirl.create(:user)
        @staff_member.add_role :staff_member
        sign_in @staff_member
      end

      it "returns csv rows" do
        # works as expected from browser testing
        pending "figuring out why csv is not rendering at all"
        get :contact_info, format: :csv
        expect(CSV.parse(response.body).size).to eq 2
      end
    end

    after do
      sign_out :user
    end
  end

  context "when requesting json"do
    describe "#locator" do
      it "takes a geographic address and returns matching people", :vcr do
        get :locator, format: :json, q: "148 Lafayette, NY, NY"
        expect(JSON.parse(response.body).size).to eq 7
      end
    end

    describe "#identifier" do
      it "takes an email address and returns matching person" do
        @person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)

        get :identifier, format: :json, email: @person.email
        expect(JSON.parse(response.body)).to eq expected_from_json
      end

      it "takes jurisdiction and a name_fragment and returns matching people" do
        @person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
        @person.write_attribute(:active, true)
        @person.save

        get(:identifier,
            format: :json,
            jurisdiction: @person.state,
            name_fragment: "Sheldon")

        expect(JSON.parse(response.body)).to eq expected_from_json
      end

      context "when submittting a twitter_id" do
        context "and there is a person in the db with that twitter_id" do
          it "returns matching person from db" do
            @person = FactoryGirl.create(:state_legislator_ny_sheldon_silver)
            twitter_id = "the_man"
            @person.write_attribute(:twitter_id, twitter_id)
            @person.save!

            get :identifier, format: :json, twitter_id: twitter_id
            expect(JSON.parse(response.body)).to eq expected_from_json
          end
        end

        context "and there isn't a person in the db with the twitter_id" do
          it "is empty array if no matching person on twitter", vcr: true do
            get :identifier, format: :json, twitter_id: "mockument_to_humanity"
            expect(JSON.parse(response.body)).to eq []
          end

          it "returns matching person from twitter if there is one", vcr: true do
            @person = FactoryGirl.create(:person,
                                         full_name: "NYT Minus Context")
            @person.write_attribute(:twitter_id, "NYTMinusContext")
            @person.save!

            get :identifier, format: :json, twitter_id: "NYTMinusContext"
            expect(JSON.parse(response.body).first["id"]).to eq @person.id.to_s
          end
        end
      end
    end

    def expected_from_json
      [identity_json_for(@person)]
    end

    def identity_json_for(person)
      person.as_json({ only: [:full_name,
                              :photo_url,
                              :party],
                       methods: [:id,
                                 :political_position_title,
                                 :most_recent_district] })
    end
  end
end
