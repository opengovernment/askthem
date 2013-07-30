require 'spec_helper'

describe MeetingAgenda do
  %w(meeting_id url fulltext).each do |attribute|
    it {should validate_presence_of attribute}
  end
end
