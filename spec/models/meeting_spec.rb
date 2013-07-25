require 'spec_helper'

describe Meeting do
  %w(meeting_date name municipality).each do |attribute|
    it {should validate_presence_of attribute}
  end
end
