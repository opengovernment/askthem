require 'spec_helper'

describe ProjectVoteSmartPersonDetail do
  before :each do
    @metadatum = Metadatum.create(abbreviation: 'vt')

    # convoluted setting of id necessary, otherwise id gets generated
    @person = Person.new(state: 'vt',
                                                     first_name: 'Ann',
                                                     last_name: 'Cummings',
                                                     district: 'Washington')
    @person.id = 'VTL000008'
    @person.save!
    @person.stub(chamber: 'upper')

    @votesmart_id = "13256"
  end
  describe '#officials' do
    context 'when officials are passed in' do
      it 'returns passed in officials' do
        @pvs = ProjectVoteSmartPersonDetail.new(@person, officials: officials)
        expect(@pvs.officials).to eq officials
      end
    end

    context 'when officials are not passed in' do
      it 'returns officials from api', :vcr do
        @pvs_person_detail = ProjectVoteSmartPersonDetail.new(@person)
        expect(@pvs_person_detail.officials.first).to eq first_official_from_api
      end
    end
  end

  describe '#votesmart_id' do
    context 'when person has a votesmart_id already' do
      before :each do
        @person.write_attribute :votesmart_id, @votesmart_id
      end

      context 'officials are not passed in' do
        before :each do
          @pvs_person_detail = ProjectVoteSmartPersonDetail.new(@person)
        end

        it 'returns the votesmart_id for the person' do
          expect(@pvs_person_detail.votesmart_id).to eq @votesmart_id
        end
      end

      context 'officials are passed in' do
        before :each do
          @pvs = ProjectVoteSmartPersonDetail.new(@person, officials: officials)
        end

        it 'returns the votesmart_id for the person' do
          expect(@pvs.votesmart_id).to eq @votesmart_id
        end
      end
    end

    context 'when person does not have a votesmart_id' do
      context 'officials are not passed in', :vcr do
        it 'returns the votesmart_id for the person' do
          @pvs_person_detail = ProjectVoteSmartPersonDetail.new(@person)
          expect(@pvs_person_detail.votesmart_id).to eq @votesmart_id
        end

        context 'and there is no matching official' do
          it 'returns nil for votesmart_id' do
            @person.district = nil
            @pvs_person_detail = ProjectVoteSmartPersonDetail.new(@person)
            expect(@pvs_person_detail.votesmart_id).to be_nil
          end
        end
      end

      context 'officials are passed in' do
        it 'returns the votesmart_id for the person' do
          @pvs = ProjectVoteSmartPersonDetail.new(@person, officials: officials)
          expect(@pvs.votesmart_id).to eq @votesmart_id
        end

        context 'and there is no matching official' do
          it 'returns nil for votesmart_id' do
            @person.district = nil
            @pvs = ProjectVoteSmartPersonDetail.new(@person, officials: officials)
            expect(@pvs.votesmart_id).to be_nil
          end
        end
      end
    end
  end

  def first_official_from_api
    JSON.parse('{"candidateId":"80645","firstName":"Timothy","nickName":"Tim","middleName":"R.","preferredName":"Timothy","lastName":"Ashe","suffix":"","title":"Senator","ballotName":"","electionParties":"","electionStatus":"","electionStage":"","electionDistrictId":"","electionDistrictName":"","electionOffice":"","electionOfficeId":"","electionStateId":"","electionOfficeTypeId":"","electionYear":"","electionSpecial":"","electionDate":"","officeParties":"Democratic, Progressive","officeStatus":"active","officeDistrictId":"27137","officeDistrictName":"Chittenden","officeStateId":"VT","officeId":"9","officeName":"State Senate","officeTypeId":"L","runningMateId":"","runningMateName":""}')
  end

  def officials
    [{"candidateId"=>"51095", "firstName"=>"Donald", "nickName"=>"Don", "middleName"=>"E.", "preferredName"=>"Donald", "lastName"=>"Collins", "suffix"=>"", "title"=>"Senator", "ballotName"=>"", "electionParties"=>"", "electionStatus"=>"", "electionStage"=>"", "electionDistrictId"=>"", "electionDistrictName"=>"", "electionOffice"=>"", "electionOfficeId"=>"", "electionStateId"=>"", "electionOfficeTypeId"=>"", "electionYear"=>"", "electionSpecial"=>"", "electionDate"=>"", "officeParties"=>"Democratic", "officeStatus"=>"active", "officeDistrictId"=>"27139", "officeDistrictName"=>"Franklin", "officeStateId"=>"VT", "officeId"=>"9", "officeName"=>"State Senate", "officeTypeId"=>"L", "runningMateId"=>"", "runningMateName"=>""}, {"candidateId"=>"13256", "firstName"=>"Ann", "nickName"=>"", "middleName"=>"E.", "preferredName"=>"Ann", "lastName"=>"Cummings", "suffix"=>"", "title"=>"Senator", "ballotName"=>"", "electionParties"=>"", "electionStatus"=>"", "electionStage"=>"", "electionDistrictId"=>"", "electionDistrictName"=>"", "electionOffice"=>"", "electionOfficeId"=>"", "electionStateId"=>"", "electionOfficeTypeId"=>"", "electionYear"=>"", "electionSpecial"=>"", "electionDate"=>"", "officeParties"=>"Democratic", "officeStatus"=>"active", "officeDistrictId"=>"27144", "officeDistrictName"=>"Washington", "officeStateId"=>"VT", "officeId"=>"9", "officeName"=>"State Senate", "officeTypeId"=>"L", "runningMateId"=>"", "runningMateName"=>""}, {"candidateId"=>"5287", "firstName"=>"William", "nickName"=>"Bill", "middleName"=>"T.", "preferredName"=>"William", "lastName"=>"Doyle", "suffix"=>"", "title"=>"Senator", "ballotName"=>"", "electionParties"=>"", "electionStatus"=>"", "electionStage"=>"", "electionDistrictId"=>"", "electionDistrictName"=>"", "electionOffice"=>"", "electionOfficeId"=>"", "electionStateId"=>"", "electionOfficeTypeId"=>"", "electionYear"=>"", "electionSpecial"=>"", "electionDate"=>"", "officeParties"=>"Republican", "officeStatus"=>"active", "officeDistrictId"=>"27144", "officeDistrictName"=>"Washington", "officeStateId"=>"VT", "officeId"=>"9", "officeName"=>"State Senate", "officeTypeId"=>"L", "runningMateId"=>"", "runningMateName"=>""}]
  end
end
