require 'spec_helper'

describe 'questions' do
  before :each do
    @metadatum = Metadatum.with(session: 'openstates')
      .create(abbreviation: 'vt', chambers: {} )
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
        3.times do
          FactoryGirl.create(:question,
                             state: @metadatum.abbreviation,
                             person: valid_person)
        end
      end

      it 'returns them' do
        visit '/vt/questions'
        page.body.should have_selector '.question_content .title'
      end
    end
  end

  describe '#new' do
    context 'as a non-registered user' do
      let(:long_body) { 'Something at least sixty characters long for the body, you know something substantial' }
      let(:steps) { %w(recipient content sign_up confirm) }
      let(:step_ids) do
        steps.inject([]) do |result, step|
          result << '#' + "#{step.gsub('_', '-')}-step"
        end
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

          page.should have_selector '.field_with_errors label.message'
        end

        it 'can get feedback based on person chosen address locator', js: true do
          valid_person

          find('a.address_lookup').trigger('click')

          fill_in 'question_user_attributes_street_address', with: '2227 Paine Turnpike'
          fill_in 'question_user_attributes_locality', with: 'Berlin'
          fill_in 'question_user_attributes_postal_code', with: '05602'

          find('#question_user_attributes_postal_code').trigger('blur')

          click_next_button

          page.should have_selector '.field_with_errors label.message'
        end
      end

      context 'when filling out question title and body' do
        before :each do
          visit "/vt/questions/new"
          add_person_id
        end

        it 'cannot progress to next step when invalid input', js: true do
          step_id = '#content-step'
          click_next_button
          expect(find(step_id).visible?).to be_true

          # try to go to next step without filling out title and body
          click_next_button

          expect(find(step_id).visible?).to be_true

          page.should have_selector '.field_with_errors label.message'
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

          page.should_not have_selector '.field_with_errors label.message'
        end
      end

      context 'when signing up user' do
        before :each do
          visit "/vt/questions/new"
          add_person_id
          add_valid_content
        end

        it 'cannot progress to next step when invalid input', js: true do
          step_id = '#sign-up-step'

          click_next_button 3, 3

          expect(find(step_id).visible?).to be_true

          # p page.body
          page.should have_selector '.field_with_errors label.message'
        end

        it 'can get feedback based on sign up input', js: true do
          click_next_button 2

          fill_in 'question_user_attributes_email', with: 'blart'
          fill_in 'question_user_attributes_password', with: 'short'

          find('#question_user_attributes_password').trigger('blur')

          click_next_button

          page.should have_selector '.field_with_errors label.message'
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
          add_person_id
          add_valid_content
          add_valid_user
        end
      end

      it 'can choose a person'
      it 'can fill out form'
    end
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

  def add_valid_user
    script = "jQuery('#question_user_attributes_given_name').val('John'); "
    script +=  "jQuery('#question_user_attributes_family_name').val('Doe'); "
    script +=  "jQuery('#question_user_attributes_email').val('john.doe@example.com'); "
    script +=  "jQuery('#question_user_attributes_password').val('testtest'); "
    page.execute_script script
  end

  # see models/person_spec for another instance
  def valid_person
    @person ||= Person.with(session: 'openstates')
      .new(state: @metadatum.abbreviation)
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
end
