require "spec_helper"

describe UnaffiliatedPersonTidyWorker do
  describe '#perform' do
    it "destroys a person if they are unaffiliated and don't have a question" do
      person = FactoryGirl.create(:person,
                                  state: Metadatum::Unaffiliated::ABBREVIATION)
      UnaffiliatedPersonTidyWorker.new.perform(person.id)
      expect { person.reload }.to raise_error(Mongoid::Errors::DocumentNotFound)
    end
  end
end
