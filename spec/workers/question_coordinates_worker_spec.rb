require "spec_helper"

describe QuestionCoordinatesWorker do
  describe '#perform' do
    it "sets coordinates based on user coordinates" do
      user = FactoryGirl.create(:user)
      question = FactoryGirl.create(:question, user: user)
      QuestionCoordinatesWorker.new.perform(question.id)
      expect(question.reload.coordinates).to eq [-73.9998334, 40.7195898]
    end
  end
end
