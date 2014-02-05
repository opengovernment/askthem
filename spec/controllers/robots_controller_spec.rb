require "spec_helper"

describe RobotsController do
  render_views

  describe "#show" do
    it "returns robots.txt file" do
      FactoryGirl.create(:metadatum, abbreviation: "vt")

      get :show, format: "txt"
      expect(response.body).to have_text question_new_disallow
    end

    def question_new_disallow
      "Disallow: /vt/questions/new"
    end
  end
end
