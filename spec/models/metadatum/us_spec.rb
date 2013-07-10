# -*- coding: utf-8 -*-
require 'spec_helper'

describe Metadatum::Us do
  describe '.find_or_create!' do
    context 'when a US jurisdiction already exists' do
      before :each do
        @metadatum = Metadatum.with(session: 'openstates')
          .create(abbreviation: 'us')
      end

      it 'returns existing US jurisdiction' do
        expect(Metadatum::Us.find_or_create!).to eq @metadatum
      end
    end

    context 'when no US jurisdiction exists' do
      it 'creates a Metadatum with US jurisdiction attributes' do
        metadatum = Metadatum::Us.find_or_create!
        expect(metadatum.attributes).to eq attributes
      end

      def attributes
        { abbreviation: 'us',
          '_id' => 'us',
          chambers: { "upper" => { "name" => "Senate", "title" => "Senator" },
            "lower" => { "name" => "House", "title" => "Representative" } },
          name: "United States",
          legislature_name: "United States Congress"
        }.with_indifferent_access
      end
    end
  end
end
