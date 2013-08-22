require 'spec_helper'
require File.expand_path("../features_helper.rb", __FILE__)

describe 'registrations' do
  # aka users/sign_up
  describe '#new' do
    before :each do
      visit '/users/sign_up'
    end

    it 'can fill out form to sign up', js: true do
      user = FactoryGirl.build(:user)

      fill_out_sign_up_form_for user

      click_button "Sign up"

      page.should have_content 'Sign out'
    end

    context 'user has email of recognized person' do
      let(:person) { FactoryGirl.create(:person_ny_sheldon_silver) }

      it 'when email entered, user is asked if they are official', js: true do
        fill_in "user_email", with: person.email
        are_you_person = "Are you #{person.first_name} #{person.last_name}?"
        page.should have_content are_you_person
      end

      # submitted with person_id outcomes:
      # validate user.email == person.email (later extended) --done
      # new identity created for user --done
      # user notified that their request will be reviewed by staff --done
      # staff notified
      it 'adds an identity and notifies appropriately', js: true do
        user = FactoryGirl.build(:user, email: person.email)
        emails_count = ActionMailer::Base.deliveries.count

        fill_out_sign_up_form_for user
        check "user_person_id_#{person.id}"
        click_button "Sign up"

        expect(Identity.count).to eq 1
        # emails count has two outgoing emails to user
        # 1 for confirm + 1 for identity
        expect(ActionMailer::Base.deliveries.count).to eq emails_count + 2
      end
    end

    def fill_out_sign_up_form_for(user)
      attribute_names = ['given_name', 'family_name', 'email', 'password',
                         'street_address', 'locality', 'postal_code']

      attribute_names.each do |attribute_name|
        fill_in "user_#{attribute_name}", with: user.send(attribute_name)
      end

      select_user_region_for(user.region)
    end
  end
end
