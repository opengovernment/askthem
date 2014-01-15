require "spec_helper"

describe MediaUploader do
  describe "#extension_white_list" do
    it "resturns image and video extensions" do
      media = ImageSrcUrl::IMAGE_TYPES + VideoSrcUrl::VIDEO_TYPES
      expect(MediaUploader.new("/file.mov").extension_white_list).to eq media
    end
  end
end
