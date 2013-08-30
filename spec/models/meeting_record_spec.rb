require 'spec_helper'

describe MeetingRecord do
  %w(url).each do |attribute|
    it {should validate_presence_of attribute}
  end
end
