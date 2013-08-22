require "spec_helper"

describe UserEmailMatchesValidator do
  let(:identity) { FactoryGirl.build(:identity) }

  describe "#validate" do
    it "is valid when emails do match" do
      expect(identity.valid?).to be_true
    end

    it "is invalid when emails do not match" do
      user = identity.user
      user.email = "xxx"
      expect(identity.valid?).to be_false
    end
  end
end
