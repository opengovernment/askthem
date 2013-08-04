require 'spec_helper'

describe Meeting do
  %w(date_and_time name municipality).each do |attribute|
    it {should validate_presence_of attribute}
  end

  describe '.load_from_api_for_jurisdiction' do
    before :each do
      scraped_local_gov = Mongoid.session(:scraped_local_gov)
      scraped_local_gov[:council_agendas].insert meeting
    end

    it 'loads meetings into database given a municipality' do
      Meeting.load_from_apis_for_jurisdiction('pa-philadelphia')
      expect(Meeting.count).to eq 1
    end

    def meeting()
      {'Meeting Date'=>{'url'=>'http://phila.legistar.com/javascript:void(0);', 'label'=>Time.zone.parse('2013-08-15 00:00:00 UTC')}, 'Meeting Time'=>'1:00 PM', 'Name'=>'Special Investigating Committee on Demolition Practices in the City of Philadelphia', 'Municipality'=>'pa-philadelphia', 'Meeting Location'=>'Room 400', 'Created Date'=>Time.zone.parse('2013-08-02 23:01:10 UTC'), 'Agenda'=>{'url'=>'http://phila.legistar.com/View.ashx?M=A&ID=259523&GUID=5E63CC63-3AC5-4929-A6E7-8451EAABF1A5', 'fulltext'=>'Recessed Hearing NoticeCity of PhiladelphiaThe Special Investigating Committee on Demolition Practices in the City of Philadelphia of the Council of the City of Philadelphia held a Public Hearing on Thursday, August 1, 2013, and recessed the public hearing until Thursday, August 15, 2013 at 1:00 PM, in Room 400, City Hall, to hear further testimony on the following:Resolution authorizing the creation of a \'Special Investigating Committee on Demolition Practices in the City of Philadelphia,\' to investigate safety problems and identify solutions related to the oversight of demolition projects in the City and, in furtherance of such investigation, authorizing the issuance of subpoenas to compel the attendance of witnesses and the production of documents to the full extent authorized under Section 2-401 of the Charter.130546Immediately following the public hearing, a meeting of the Special Investigating Committee on Demolition Practices in the City of Philadelphia, open to the public, will be held to consider the action to be taken on the above listed item.Copies of the foregoing item are available in the Office of the Chief Clerk of the Council, Room 402, City Hall.Michael DeckerChief ClerkCity of Philadelphia- 1 -\\f', 'label'=>'Agenda'}, 'Minutes'=>'Not available'}
    end
  end
end
