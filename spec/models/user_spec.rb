require 'spec_helper'

describe User do
  %w(given_name family_name postal_code country).each do |attribute|
    it {should validate_presence_of attribute}
  end

  it {should validate_inclusion_of(:region).to_allow(*OpenGovernment::STATES.values)}
  it {should validate_inclusion_of(:country).to_allow('US')}

  context 'with a persisted user' do
    let :user do
      FactoryGirl.create(:user)
    end

    describe '#name' do
      it "should return the user's formatted name" do
        user.name.should == 'John Public'
      end
    end

    describe '#alternate_name' do
      it "should return the user's persisted given name" do
        user.alternate_name.should == 'John'
        user.given_name = 'Bob'
        user.alternate_name.should == 'John'
      end
    end

    describe '#questions_signed' do
      it "should return the questions signed by the user" do
        @questions = FactoryGirl.create_list(:question, 4)
        @questions.first(2).each do |question|
          FactoryGirl.create(:signature, user: user, question: question)
        end
        user.questions_signed.should == @questions.first(2)
      end
    end

    describe '#top_issues' do
      it "should return the subjects of the questions asked" do

        2.times do
          question = FactoryGirl.create(:question, user: user)
          question.subject = "A Great Subject"
          question.save
        end

        user.top_issues.should == ["A Great Subject"]
      end
    end

    describe 'address_for_geocoding' do
      it "should return the user's address for geocoding" do
        user.address_for_geocoding.should == '148 Lafayette St, New York, ny, US, 10013'
      end
    end

    describe "#verified" do
      context "when user has at least one verified identity" do
        let(:identity) { FactoryGirl.create(:identity, status: "verified") }
        let(:user) { identity.user }

        it "is true" do
          expect(user.verified?).to be_true
        end
      end

      context "when user has at least one verified identity" do
        it "is false" do
          expect(user.verified?).to be_false
        end
      end
    end
  end

  context "with after_create callback" do
    it "geocodes address to lat long", :vcr do
      user = FactoryGirl.build(:user)
      user.coordinates = nil
      user.save
      expect(user.reload.to_coordinates).to eq [40.7195898, -73.9998334]
    end
  end
end
