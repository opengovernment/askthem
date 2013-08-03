require 'spec_helper'

describe Minutes do
  %w(url fulltext).each do |attribute|
    it {should validate_presence_of attribute}
  end
end
