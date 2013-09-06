require "spec_helper"

describe GeocodeWorker do
  describe '#perform' do
    it "should geocode the object's address", :vcr do
      user = FactoryGirl.create(:user)
      user.coordinates = nil
      user.save!
      GeocodeWorker.new.perform(user.id)
      expect(user.reload.to_coordinates).to eq [40.7195898, -73.9998334]
    end
  end
end
