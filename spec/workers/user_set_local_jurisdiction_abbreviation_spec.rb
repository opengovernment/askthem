require "spec_helper"

describe UserSetLocalJurisdictionAbbreviationWorker do
  describe '#perform' do
    it "sends email asking user to set their password" do
      user = FactoryGirl.create(:user)

      UserSetLocalJurisdictionAbbreviationWorker.new.perform(user.id)

      expect(user.reload.local_jurisdiction_abbreviation).to eq "ny-new-york"
    end
  end
end
