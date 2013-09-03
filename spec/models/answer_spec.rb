require 'spec_helper'

describe Answer do
  %w(text question_id).each do |attribute|
    it {should validate_presence_of attribute}
  end
end
