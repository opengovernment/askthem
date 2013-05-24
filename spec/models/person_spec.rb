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

  describe '#most_recent_district' do
    it 'returns nothing when there is no district' do
      expect(@person.most_recent_district).to be_nil
    end

    it 'returns district when there is only one district' do
      district = '1'
      @person[:district] = district
      expect(@person.most_recent_district).to eq district
    end

    # when person is inactive, most recent old_role's district
    it 'returns correct district when the person has more than one old role' do
      district = 'Chittenden-3-4'

      @person[:old_roles] = {
        '2007-2008' =>
        [{ 'term' => '2007-2008',
           'end_date' => nil,
           'district' => 'Chittenden-3-1',
           'level' => 'state',
           'country' => 'us',
           'chamber' => 'lower',
           'state' => 'vt',
           'party' => 'Progressive',
           'type' => 'member',
           'start_date' => nil }],
        '2009-2010' =>
        [{ 'term' => '2009-2010',
           'end_date' => nil,
           'district' => district,
           'level' => 'state',
           'country' => 'us',
           'chamber' => 'lower',
           'state' => 'vt',
           'party' => 'Progressive',
           'type' => 'member',
           'start_date' => nil }]}

      expect(@person.most_recent_district).to eq district
    end
  end
end
