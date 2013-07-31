require 'spec_helper'

describe Meeting do
  %w(meeting_date name municipality).each do |attribute|
    it {should validate_presence_of attribute}
  end
end

describe '.load_from_api_for_jurisdiction' do
  it 'loads meetings into database given a municipality', :vcr do
    Meeting.load_from_apis_for_jurisdiction()
    expect(Meeting.distinct(:name).length).to be >= 27 # distinct meeting names for Philly
  end
end
