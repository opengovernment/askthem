require 'spec_helper'

describe Meeting do
  %w(meeting_date name municipality).each do |attribute|
    it {should validate_presence_of attribute}
  end

  describe '.load_from_api_for_jurisdiction' do
    it 'loads meetings into database given a municipality' do
      Meeting.load_from_apis_for_jurisdiction()
      # distinct meeting names for Philly
      expect(Meeting.distinct(:name).length).to be >= 27
    end
  end
end
