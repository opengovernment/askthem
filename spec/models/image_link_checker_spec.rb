require "spec_helper"

describe ImageLinkChecker do
  describe "#accessible?", vcr: true do
    it "is true if url is available and its content type is an image" do
      url = "http://w3.legis.state.ak.us/images/senate/STG.jpg"
      expect(ImageLinkChecker.new(url).accessible?).to be_true
    end

    it "is false if url 404 or similar" do
      url = "http://www.askthem.io/some-bad-url"
      expect(ImageLinkChecker.new(url).accessible?).to be_false
    end

    it "is false if url's content type is not an image" do
      # returns a html page saying 404, but with 200 response
      url = "http://w3.legis.state.ak.us/images/senate/STGGGGG.jpg"
      expect(ImageLinkChecker.new(url).accessible?).to be_false
    end
  end
end
