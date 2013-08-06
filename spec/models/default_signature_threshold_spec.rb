require 'spec_helper'

describe DefaultSignatureThreshold do
  describe '#value' do
    context 'person_id is present' do
      before :each do
        @person = Person.create(state: 'zz')
      end

      it 'returns default based on person' do
        expect(DefaultSignatureThreshold.new(@person).value)
          .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:state]
      end
    end

    context 'person_id is not present' do
      it 'returns hardcoded default' do
        expect(DefaultSignatureThreshold.new(nil).value)
          .to eq DefaultSignatureThreshold::DEFAULT_VALUES[:unspecified_person]
      end
    end
  end
end
