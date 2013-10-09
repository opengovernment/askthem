require "spec_helper"

describe ApplicationHelper do
  describe "#should_have_ask_question_in_header?" do
    it "returns false when on a person's detail pages" do
      params[:controller] = "people"
      params[:action] = "show"
      expect(helper.should_have_ask_question_in_header?).to be_false
    end

    it "returns true when not on a person's detail pages" do
      params[:controller] = "pages"
      params[:action] = "index"
      expect(helper.should_have_ask_question_in_header?).to be_true
    end
  end
end
