require 'spec_helper'

describe Signature do
  %w(user_id question_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  it {should validate_uniqueness_of(:user_id).scoped_to(:question_id)}

  it "should copy the user's fields" do
    user = FactoryGirl.create(:user)
    signature = FactoryGirl.create(:signature, user: user)
    signature.given_name.should     == user.given_name
    signature.family_name.should    == user.family_name
    signature.street_address.should == user.street_address
    signature.locality.should       == user.locality
    signature.region.should         == user.region
    signature.postal_code.should    == user.postal_code
    signature.country.should        == user.country
  end

  context "with callbacks" do
    let(:signature) { FactoryGirl.create(:signature) }
    context "when created" do
      it "should add to question's signature_count" do
        expect(signature.question.signature_count).to eq 1
      end
      it "should appropriately flag the question's signature threshold as met" do
        users = FactoryGirl.create_list(:user, 101)
        question = FactoryGirl.create(:question)
        users.each do |u|
          FactoryGirl.create(:signature, user: u, question: question)
        end
        expect(question.threshold_met?).to eq true
      end
    end

    context "when destroyed" do
      it "should be dropped from question's signature_count" do
        question = signature.question
        signature.destroy
        expect(question.signature_count).to eq 0
      end
    end
  end
end
