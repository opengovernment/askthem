# -*- coding: utf-8 -*-
require 'spec_helper'

describe Metadatum::State do
  describe '.create_states_if_none' do
    context 'when the state jurisdictions already exist' do
      before :each do
        @metadata = []
        OpenGovernment::STATES.each do |key, value|
          @metadata << Metadatum.with(session: 'openstates')
            .create(name: key, abbreviation: value)

        end
      end

      it 'does nothing because there is existing state Metadatum' do
        Metadatum::State.create_states_if_none
        metadata_count = Metadatum.with(session: 'openstates').count
        expect(metadata_count).to eq @metadata.size
      end
    end

    context 'when no state jurisdictions exist' do
      it 'creates a Metadatum with the states jurisdiction attributes', :vcr do
        Metadatum::State.create_states_if_none
        metadata_count = Metadatum.with(session: 'openstates').count
        expect(metadata_count).to eq OpenGovernment::STATES.size
      end
    end
  end

  describe '.create_states_from_api' do
    it 'creates states from api attributes', :vcr do
      Metadatum::State.create_states_from_api
      metadata_count = Metadatum.with(session: 'openstates').count
      expect(metadata_count).to eq OpenGovernment::STATES.size
    end
  end
end
