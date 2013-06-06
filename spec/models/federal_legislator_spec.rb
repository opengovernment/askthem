require 'spec_helper'

describe FederalLegislator do
  before :each do
    @metadatum = Metadatum.with(session: 'openstates').create(abbreviation: 'us')
  end

  describe '#attributes_from_congress_api' do
    it 'takes result from api and equivalent attributes' do
      result = { 'bioguide_id' => 'K000385',
        'chamber' => 'house',
        'district' => 2,
        'first_name' => 'Robin',
        'gender' => 'F',
        'last_name' => 'Kelly',
        'middle_name' => nil,
        'name_suffix' => nil,
        'party' => 'D',
        'state' => 'IL',
        'terms'=>[{ 'start' => '2013-04-09',
                    'end' => '2015-01-03',
                    'state' => 'IL',
                    'district' => 2,
                    'party' => 'D',
                    'title' => 'Rep',
                    'chamber' => 'house' }],
        'votesmart_id'=>33384 }

      roles = [{ term: '2013-2015',
                 start_date: result['terms'].first['start'],
                 end_date: result['terms'].first['end'],
                 state: 'us',
                 district: 2,
                 title: 'Rep',
                 party: 'Democratic',
                 chamber: 'lower' }]

      attributes = { _id: result['bioguide_id'],
        _type: 'FederalLegislator',
        leg_id: result['bioguide_id'],
        chamber: 'lower',
        district: 2,
        state: 'us',
        last_name: result['last_name'],
        first_name: result['first_name'],
        middle_name: result['middle_name'],
        suffixes: result['name_suffix'],
        party: 'Democratic',
        '+gender' => 'Female',
        roles: roles
      }.with_indifferent_access

      federal_legislator = FederalLegislator.new
      federal_legislator.attributes_from_congress_api result
      expect(federal_legislator.attributes).to eq attributes
    end
  end

  # describe '.for_location' do
  #   it 'returns matching people given a location', :vcr do
  #     address = '2227 Paine Turnpike South, Berlin, VT'
  #     expect(FederalLegislator.with(session: 'openstates').for_location(address).first).to eq @federal_legislator
  #   end
  # end
end
