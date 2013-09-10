require 'spec_helper'

describe MinutesDocument do
  %w(url).each do |attribute|
    it {should validate_presence_of attribute}
  end
end
