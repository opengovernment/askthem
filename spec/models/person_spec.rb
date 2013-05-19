require 'spec_helper'

describe Person do
  before :each do
    @metadatum = Metadatum.with(session: 'openstates').create(abbreviation: 'vt')
    # convoluted setting of id necessary, otherwise id gets generated
    @person = Person.with(session: 'openstates').new(state: 'vt')
    @person.id = 'VTL000008'
    @person.save!
  end

  describe '.for_location' do
    it 'returns matching people given a location', :vcr do
      address = '2227 Paine Turnpike South, Berlin, VT'
      expect(Person.with(session: 'openstates').for_location(address).first).to eq @person
    end
  end
end
