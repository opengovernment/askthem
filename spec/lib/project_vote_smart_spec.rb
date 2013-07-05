require 'spec_helper'

describe ProjectVoteSmart do
  let(:api) { ProjectVoteSmart.new }

  describe '#office_ids' do
    it 'returns Chairman and Councilmember ids if dc' do
      expect(api.office_ids(state: 'dc')).to eq [347, 368]
    end

    it 'returns State Assembly and State House ids if lower chamber' do
      expect(api.office_ids(state: 'vt', chamber: 'lower')).to eq [7, 8]
    end

    it 'returns state senate id if not dc and lower chamber' do
      expect(api.office_ids(state: 'vt', chamber: 'upper')).to eq [9]
    end
  end

  describe '#officials_by_state_and_office' do
    it 'returns officials for state and office', :vcr do
      expect(api.officials_by_state_and_office('vt', [9]).first).to eq first_vt_state_senator
    end
  end

  describe '#get' do
    it 'returns results from Project Vote Smart api', :vcr do
      results = api.get('Officials.getByOfficeState',
                        officeId: 9,
                        stateId: 'VT')

      expect(results.first).to eq first_vt_state_senator
    end
  end

  def first_vt_state_senator
    {"candidateId"=>"80645", "firstName"=>"Timothy", "nickName"=>"Tim", "middleName"=>"R.", "preferredName"=>"Timothy", "lastName"=>"Ashe", "suffix"=>"", "title"=>"Senator", "ballotName"=>"", "electionParties"=>"", "electionStatus"=>"", "electionStage"=>"", "electionDistrictId"=>"", "electionDistrictName"=>"", "electionOffice"=>"", "electionOfficeId"=>"", "electionStateId"=>"", "electionOfficeTypeId"=>"", "electionYear"=>"", "electionSpecial"=>"", "electionDate"=>"", "officeParties"=>"Democratic, Progressive", "officeStatus"=>"active", "officeDistrictId"=>"27137", "officeDistrictName"=>"Chittenden", "officeStateId"=>"VT", "officeId"=>"9", "officeName"=>"State Senate", "officeTypeId"=>"L", "runningMateId"=>"", "runningMateName"=>""}
  end
end
