require "spec_helper"

describe ImageSrcUrl do
  describe "#is_image?" do
    it "is false if file or url is does't have image extension" do
      expect(ImageSrcUrl.new("/file.mov").is_image?).to be_false
    end

    it "is true if file or url is does have image extension" do
      expect(ImageSrcUrl.new("/file.png").is_image?).to be_true
    end
  end
end
