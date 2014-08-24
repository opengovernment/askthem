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

    describe "address_for_geocoding" do
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

    describe "local_jurisdiction" do
      it "should return a metadatum that matches the user's city if exists" do
        abbreviation = "ny-new-york"
        new_york = FactoryGirl.create(:metadatum, abbreviation: abbreviation)
        user.local_jurisdiction_abbreviation = abbreviation

        expect(user.local_jurisdiction).to eq new_york
      end
    end
  end

  describe "#update_address_from_string", vcr: true do
    let(:user) { User.new }

    it "populates address attributes for user" do
      address_string = "222 Elm St, Montpelier, VT 05602"
      full_address = "222 Elm Street, Montpelier, VT, US, 05602"

      user.update_address_from_string(address_string)

      expect(user.address_for_geocoding).to eq full_address
    end
  end

  context "with after_create callback" do
    it "geocodes address to lat long", :vcr do
      user = FactoryGirl.build(:user)
      user.coordinates = nil
      user.save
      expect(user.reload.to_coordinates).to eq [40.7195898, -73.9998334]
    end

    it "sets local_jurisidiction_abbreviation" do
      user = FactoryGirl.create(:user)
      expect(user.reload.local_jurisdiction_abbreviation).to eq "ny-new-york"
    end
  end
end
