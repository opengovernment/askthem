require "spec_helper"

describe VideoSrcUrl do
  describe "#is_video?" do
    it "is true if file or url does have video extension" do
      expect(VideoSrcUrl.new("/file.mov").is_video?).to be_true
    end

    it "it recognizes video extension that has different capitalization" do
      expect(VideoSrcUrl.new("/file.MOV").is_video?).to be_true
    end

    context "when no video hosting site matches" do
      it "is false if file or url is does't have video extension" do
        expect(VideoSrcUrl.new("/file.png").is_video?).to be_false
      end
    end

    it "is true when url is already direct video link from service" do
      youtube_video = "http://www.youtube.com/embed/6IUu2KJI_5k?rel=0"
      expect(VideoSrcUrl.new(youtube_video).is_video?).to be_true
    end
  end

  describe "#value" do
    it "returns original if it has an extension" do
      original_url = "/file.mov"
      expect(VideoSrcUrl.new(original_url).value).to eq original_url
    end

    it "returns original if it is already hosted service viewer url" do
      original_url = "http://player.vimeo.com/video/80343648?badge=0"
      expect(VideoSrcUrl.new(original_url).value).to eq original_url
    end

    it "returns viewer url for hosted service" do
      original_url = "http://www.youtube.com/watch?v=6IUu2KJI_5k"
      viewer_url = "http://youtube.com/embed/6IUu2KJI_5k"
      expect(VideoSrcUrl.new(original_url).value).to eq viewer_url
    end
  end
end
