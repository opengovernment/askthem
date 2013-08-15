require 'spec_helper'

describe PagesController do
  context 'when requesting json'do
    # @warn can't use let because of mongoid teardown
    before :each do
      @person = FactoryGirl.create(:person_ny_sheldon_silver)
    end

    describe "#locator" do
      it "takes a geographic address and returns matching people", :vcr do
        get :locator, format: :json, q: '148 Lafayette, NY, NY'
        expect(JSON.parse(response.body)).to eq expected_from_json
      end
    end

    describe "#identifier" do
      it "takes an email address and returns matching person" do
        get :identifier, format: :json, email: @person.email
        expect(JSON.parse(response.body)).to eq expected_from_json
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
                                 :most_recent_chamber_title,
                                 :most_recent_district] })
    end
  end
end
