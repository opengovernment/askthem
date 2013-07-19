require 'spec_helper'

describe FederalLegislator do
  describe '#image?' do
    it 'returns false if not persisted or id is not set' do
      federal_legislator = FederalLegislator.new
      expect(federal_legislator.image?).to be_false
    end

    it 'returns true if persisted and an id is set' do
      federal_legislator = FederalLegislator.create!(first_name: 'Ralf',
                                                     last_name: 'The Mouth')
      expect(federal_legislator.image?).to be_true
    end
  end

  describe '#image' do
    it 'returns standard URL for where to find 100x125 image' do
      federal_legislator = FederalLegislator.new
      federal_legislator.id = 'K000385'
      image_url = "#{FederalLegislator::PHOTOS_BASE_URL}#{federal_legislator.id}.jpg"
      expect(federal_legislator.image).to eq image_url
    end
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
        state: 'il',
        full_name: "#{result['first_name']} #{result['last_name']}",
        last_name: result['last_name'],
        first_name: result['first_name'],
        middle_name: result['middle_name'],
        suffixes: result['name_suffix'],
        party: 'Democratic',
        '+gender' => 'Female',
        roles: roles,
        active: true,
        votesmart_id: '33384'
      }.with_indifferent_access

      federal_legislator = FederalLegislator.new
      federal_legislator.attributes_from_congress_api result
      expect(federal_legislator.attributes).to eq attributes
    end
  end

  describe '.for_location' do
    before :each do
      # convoluted setting of id necessary, otherwise id gets generated
      @federal_legislator = FederalLegislator.with(session: 'openstates').new(state: 'vt')
      @federal_legislator.id = 'S000033'
      @federal_legislator.save!
    end

    it 'returns matching people given a location', :vcr do
      address = '2227 Paine Turnpike South, Berlin, VT'
      expect(FederalLegislator.with(session: 'openstates').for_location(address).first).to eq @federal_legislator
    end
  end

  describe '.load_from_api_for_jurisdiction' do
    it 'loads people into database given a state abbreviation', :vcr do
      FederalLegislator.with(session: 'openstates').load_from_apis_for_jurisdiction('vt')
      expect(FederalLegislator.with(session: 'openstates').count).to eq 3
    end
  end
end
