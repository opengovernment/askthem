require 'spec_helper'

describe Minutes do
  %w(url full_text).each do |attribute|
    it {should validate_presence_of attribute}
  end
end
