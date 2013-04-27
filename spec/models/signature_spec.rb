require 'spec_helper'

describe Signature do
  %w(user_id question_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  it {should validate_uniqueness_of(:user_id).scoped_to(:question_id)}

  it "should copy the user's fields" do
    user = FactoryGirl.create(:user)
    signature = FactoryGirl.create(:signature, user: user)
    signature.given_name.should     == user.given_name
    signature.family_name.should    == user.family_name
    signature.street_address.should == user.street_address
    signature.locality.should       == user.locality
    signature.region.should         == user.region
    signature.postal_code.should    == user.postal_code
    signature.country.should        == user.country
  end
end
