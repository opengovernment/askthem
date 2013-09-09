require 'spec_helper'
require File.expand_path("../features_helper.rb", __FILE__)

describe 'meeting' do

  describe '#index' do

    context 'state jurisdiction' do
      it 'returns none' do
        Metadatum.create(name: 'Vermont',
                         abbreviation: 'vt',
                         chambers: {} )

        visit '/vt'
        page.body.should_not have_selector '.meetings-tab'
      end
    end

    context "local jurisdiction" do
      before :each do
        Metadatum.create(name: 'Philadelphia',
                         abbreviation: 'pa-philadelphia',
                         chambers: {} )
      end

      context 'when it has no meetings' do
        it 'returns none' do
          visit '/pa-philadelphia/overview/meetings'
          page.body.should have_content 'No meetings found'
        end
      end

      context 'when it has meetings' do
        it 'returns them' do
          FactoryGirl.create(:meeting)
          visit '/pa-philadelphia/overview/meetings'
          page.body.should have_content 'Date Name Agenda Minutes'
        end
      end
    end
  end

end
