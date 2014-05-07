require "spec_helper"

describe PersonCheckPhotoUrlWorker do
  describe '#perform' do
    context "when person's photo_url is not available" do
      it "the photo_url is archived", vcr: true do
        photo_url = "http://example.com/example.jpg"
        person = FactoryGirl.create(:person, photo_url: photo_url)

        PersonCheckPhotoUrlWorker.new.perform(person.id)

        person.reload

        expect(person.old_photo_urls).to eq [photo_url]
        expect(person.photo_url).to be_nil
      end
    end
  end
end
