require 'spec_helper'
require File.expand_path("../features_helper.rb", __FILE__)

describe 'questions' do
  let(:street_address) { '2227 Paine Turnpike' }
  let(:locality) { 'Berlin' }
  let(:region) { 'vt' }
  let(:postal_code) { '05602' }

  before :each do
    @metadatum = Metadatum.create(name: 'Vermont',
                                  abbreviation: 'vt',
                                  chambers: {} )
  end

  describe '#index' do
    context 'when the jurisdiction has no questions' do
      it 'returns none' do
        visit '/vt/questions'

        page.body.should_not have_selector '.question_content .title'
        page.body.should_not have_selector '.pagination'
      end
    end

    context 'when the jurisdiction has questions' do
      before :each do
        @all_questions = []
        3.times do
          @all_questions << FactoryGirl.create(:question,
                             state: @metadatum.abbreviation,
                             person: valid_person)
        end
        FactoryGirl.create(:signature, question: @all_questions.last)
        FactoryGirl.create(:answer, question: @all_questions.first)
      end

      it 'returns them' do
        visit '/vt/questions'
        page.body.should have_selector '.question_content .title'
      end

      it 'shows the correct threshold for the person' do
        visit '/vt/questions'
        page.body.should have_content "out of #{@all_questions[0].person.signature_threshold}"

      end

      context 'as signed in user' do
        it 'allows user to sign on to a question', js: true do
          valid_person
          as_user do
            visit '/vt/questions'
            click_link 'Sign'
            page.should have_content 'Signed'
            page.body.should have_content '1 out of'
          end
        end
      end

      context 'when a filter is clicked' do
        it 'applies the filter', js: true do
          visit '/vt/questions'
          click_link 'Need Signatures'
          page.should have_no_content "1 out of"
        end
      end

    end
  end

  describe '#new' do
    let(:long_body) { 'Something at least sixty characters long for the body, you know something substantial' }
    let(:steps) { %w(recipient content sign_up confirm) }
    let(:step_ids) do
      steps.inject([]) do |result, step|
        result << '#' + "#{step.gsub('_', '-')}-step"
      end
    end

    context 'as signed in user' do
      before :each do
        @user = FactoryGirl.create(:user, street_address: street_address,
                                   locality: locality, region: region,
                                   postal_code: postal_code)
      end

      it 'can fill out and submit complete form', js: true, vcr: true do
        valid_person
        as_user(@user) do
          visit '/vt/questions/new'

          choose_person false
          click_next_button
          fields_should_be_valid

          add_valid_content
          click_next_button
          fields_should_be_valid

          click_button 'Publish'
          page.body.should have_content 'Support this question'
        end
      end
    end

    context 'as a non-registered user' do
      it 'can fill out and submit complete form', js: true, vcr: true do
        valid_person
        visit '/vt/questions/new'

        choose_person
        click_next_button
        fields_should_be_valid

        add_valid_content
        click_next_button
        fields_should_be_valid

        add_valid_user
        click_next_button
        fields_should_be_valid

        click_button 'Publish'
        page.body.should have_content 'Support this question'
      end

      context 'when choosing a recipient' do
        before :each do
          visit '/vt/questions/new'
        end

        it 'cannot progress to next step when invalid input', js: true do
          step_id = '#recipient-step'

          # try to go to next step without filling out choosing a person
          find('#next-button').trigger('click')

          sleep 2
          expect(find(step_id).visible?).to be_true

          fields_should_be_invalid
        end

        it 'can choose a person from address locator', js: true, vcr: true do
          valid_person
          choose_person
          selector = "#question_person_id_#{@person.id}"
          expect(find(selector).value).to eq @person.id
          expect(find(selector).checked?).to be_true
        end

        it 'can get feedback based on person chosen address locator', js: true, vcr: true do
          valid_person
          fill_out_address
          click_next_button

          fields_should_be_invalid
        end
      end

      context 'when a recipient is already specified' do
        before :each do
          valid_person
          visit "/vt/questions/new?person=#{@person.id}"
        end

        it 'has person_id on all parts of the form', js: true do
          expect(find('#question_person_id').value).to eq @person.id

          click_next_button 2

          expect(find('#question_person_id').value).to eq @person.id
        end

        # vcr is necessary to recreate when this test would fail
        it 'can fill out and submit complete form', js: true, vcr: true do
          add_valid_content
          click_next_button
          fields_should_be_valid

          add_valid_user
          fill_out_address(false)
          click_next_button
          fields_should_be_valid

          click_button 'Publish'
          page.body.should have_content 'Support this question'
        end
      end

      context 'when filling out question title and body' do
        before :each do
          visit "/vt/questions/new"
          add_valid_address
          add_person_id
        end

        it 'cannot progress to next step when invalid input', js: true do
          step_id = '#content-step'
          click_next_button
          expect(find(step_id).visible?).to be_true

          # try to go to next step without filling out title and body
          click_next_button

          expect(find(step_id).visible?).to be_true

          fields_should_be_invalid
        end

        it 'can get feedback based on input', js: true do
          click_next_button

          find('#question_title').trigger('blur')
          page.body.should have_content "can't be blank"

          fill_in 'question_body', with: 'short body'
          page.body.should have_content 'is too short'

          fill_in 'question_title', with: 'anything'
          fill_in 'question_body', with: long_body

          find('#question_title').trigger('blur')
          find('#question_body').trigger('blur')

          fields_should_be_valid
        end
      end

      context 'when signing up user' do
        before :each do
          visit "/vt/questions/new"
          add_valid_address
          add_person_id
          add_valid_content
        end

        it 'cannot progress to next step when invalid input', js: true do
          step_id = '#sign-up-step'

          click_next_button 3, 3

          expect(find(step_id).visible?).to be_true

          fields_should_be_invalid
        end

        it 'can get feedback based on sign up input', js: true do
          click_next_button 2

          fill_in 'question_user_attributes_email', with: 'blart'
          fill_in 'question_user_attributes_password', with: 'short'

          find('#question_user_attributes_password').trigger('blur')

          click_next_button

          fields_should_be_invalid
        end
      end

      context 'if step fields are valid' do
        before :each do
          visit '/vt/questions/new'
          add_valid_values
        end

        it 'can click next and move to next section of the form', js: true do
          step_ids.each do |step_id|
            expect(find(step_id).visible?).to be_true

            unless step_id == step_ids.last
              click_next_button
              expect(find(step_id).visible?).to be_false
            end
          end
        end

        it 'can click edit and return to beginning of form', js: true do
          number_of_clicks = step_ids.size - 1
          number_of_clicks.times do
            click_next_button
          end

          expect(find('#edit-button').visible?).to be_true
          find('#edit-button').trigger('click')
          sleep 1

          expect(find(step_ids.first).visible?).to be_true
          expect(find(step_ids.last).visible?).to be_false
        end

        def add_valid_values
          add_valid_address
          add_person_id
          add_valid_content
          add_valid_user
        end
      end
    end
  end

  describe '#show' do
    context 'when displaying signature information' do
      before :each do
        @question = FactoryGirl.create(:question,
                                       state: @metadatum.abbreviation,
                                       person: valid_person)
      end

      it 'displays number of signatures for question', js: true do
        FactoryGirl.create(:signature, question: @question)
        visit "/vt/questions/#{@question.id}"
        signatures_on_page = find('span.question-signatures').text.to_i
        expect(signatures_on_page).to eq @question.signatures.count
      end

      it 'displays signature threshold number for recipient', js: true do
        visit "/vt/questions/#{@question.id}"
        threshold_on_page = find('span.question-signature-threshold').text.to_i
        expect(threshold_on_page).to eq @person.signature_threshold
      end

      it 'renders modal when created parameter is present', js: true do
        visit "/vt/questions/#{@question.id}?created=true"
        page.body.should have_selector "#modal"
      end

      it 'allows new user to register and sign on to a question', js: true, vcr: true do
        visit "/vt/questions/#{@question.id}"

        within ".signup" do
          fill_in 'user_given_name', with: 'John'
          fill_in 'user_family_name', with: 'Doe'
          fill_in 'user_email', with: 'john.doe@example.com'
          fill_in 'user_postal_code', with: postal_code
          click_button 'Sign'
        end

        page.body.should have_content '1 out of'
      end

      context 'as signed in user' do
        it 'allows user to sign on to a question', js: true do
          valid_person
          as_user do
            visit '/vt/questions'
            click_link 'Sign'
            page.should have_content 'Signed'
            page.body.should have_content '1 out of'
          end
        end
      end

    end
  end

  def choose_person(need_to_fill_out_address = true)
    fill_out_address if need_to_fill_out_address
    click_link "Vermont State"
    sleep 2
    page.execute_script "jQuery('#question_person_id_#{@person.id}').parents('li').trigger('click')"
  end

  def fill_out_address(with_lookup = true)
    find('a.address_lookup').trigger('click') if with_lookup

    fill_in 'question_user_attributes_street_address', with: street_address
    fill_in 'question_user_attributes_locality', with: locality
    fill_in 'question_user_attributes_postal_code', with: postal_code

    sleep 2 # allow for fade in
  end

  def add_person_id
    person_id_field = "<li><input type=\"radio\" name=\"question[person_id]\" id=\"question_person_id_1\" value=\"1\" checked /></li>"
    script = "jQuery('ol.people-list').last().append('#{person_id_field}'); "
    page.execute_script script
  end

  def add_valid_content
    script = "jQuery('#question_title').val('test'); "
    script +=  "jQuery('#question_body').val('#{long_body}'); "
    page.execute_script script
  end

  def add_valid_address
    script = "jQuery('#question_user_attributes_street_address').val('#{street_address}'); "
    script +=  "jQuery('#question_user_attributes_locality').val('#{locality}'); "
    script +=  "jQuery('#question_user_attributes_region').val('#{region}'); "
    script +=  "jQuery('#question_user_attributes_postal_code').val('#{postal_code}'); "
    page.execute_script script
  end

  def add_valid_user
    script = "jQuery('#question_user_attributes_given_name').val('John'); "
    script +=  "jQuery('#question_user_attributes_family_name').val('Doe'); "
    script +=  "jQuery('#question_user_attributes_email').val('john.doe@example.com'); "
    script +=  "jQuery('#question_user_attributes_password').val('testtest'); "
    page.execute_script script
  end

  # see models/person_spec for another instance
  def valid_person
    @person ||= Person.new(state: @metadatum.abbreviation)
    @person.id = 'VTL000008'
    @person.save!
    @person
  end

  def click_next_button(number_of_clicks = 1, sleepy_time = 1)
    number_of_clicks.times do
      find('#next-button').trigger('click')
      sleep sleepy_time
    end
  end

  def fields_should_be_invalid
    page.body.should have_selector '.field_with_errors label.message'
  end

  def fields_should_be_valid
    page.body.should_not have_selector '.field_with_errors label.message'
  end
end
