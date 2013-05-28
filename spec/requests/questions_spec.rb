require 'spec_helper'

describe 'questions' do
  describe '#new' do
    context 'as a non-registered user' do
      let(:long_body) { 'Something at least sixty characters long for the body, you know something substantial' }
      let(:steps) { %w(recipient content sign_up confirm) }
      let(:step_ids) do
        steps.inject([]) do |result, step|
          result << '#' + "#{step.gsub('_', '-')}-step"
        end
      end

      before :each do
        Metadatum.with(session: 'openstates').create(abbreviation: 'vt',
                                                     chambers: {} )
        visit '/vt/questions/new'
      end

      it 'can get feedback on input based on question title and body', js: true do
        find('#next-button').trigger('click')

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

      context 'if step fields are valid' do
        before :each do
          add_valid_values
        end

        it 'can click next and move to next section of the form', js: true do
          step_ids.each do |step_id|
            expect(find(step_id).visible?).to be_true

            unless step_id == step_ids.last
              find('#next-button').trigger('click')
              sleep 1 # allow for fade out
              expect(find(step_id).visible?).to be_false
            end
          end
        end

        it 'can click edit and return to beginning of form', js: true do
          number_of_clicks = step_ids.size - 1
          number_of_clicks.times do
            find('#next-button').trigger('click')
            sleep 1
          end

          expect(find('#edit-button').visible?).to be_true
          find('#edit-button').trigger('click')
          sleep 1

          expect(find(step_ids.first).visible?).to be_true
          expect(find(step_ids.last).visible?).to be_false
        end

        def add_valid_values
          page.execute_script("jQuery('#question_title').val('test'); jQuery('#question_body').val('#{long_body}');")
        end
      end

      it 'can choose a person'
      it 'can fill out form'
      it 'can recieve validation error warnings when form person or user is invalid'
    end
  end
end
