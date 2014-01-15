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

  describe "#is_image?" do
    it "returns false when file type is not present" do
      expect(helper.is_image?("")).to be_false
    end

    it "returns false when file type is not an image" do
      expect(helper.is_image?("http://example.com/file.html")).to be_false
    end

    it "returns true when file type is an image" do
      expect(helper.is_image?("http://example.com/file.png")).to be_true
    end
  end
end
