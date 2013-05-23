require 'spec_helper'

describe 'questions' do
  describe '#new' do
    context 'as a non-registered user' do
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

      it 'can click next and move to next section of the form', js: true do
        step_ids.each do |step_id|
          expect(find(step_id).visible?).to be_true

          unless step_id == step_ids.last
            find('#next-button').trigger('click')
            expect(find(step_id).visible?).to be_false
          end
        end
      end

      it 'can click edit and return to beginning of form', js: true do
        number_of_clicks = step_ids.size - 1
        number_of_clicks.times { find('#next-button').trigger('click') }

        expect(find('#edit-button').visible?).to be_true
        find('#edit-button').trigger('click')

        expect(find(step_ids.first).visible?).to be_true
        expect(find(step_ids.last).visible?).to be_false
      end

      it 'can choose a person'
      it 'can fill out form'
      it 'can recieve validation error warnings when form person, user, or question is invalid'
    end
  end
end
