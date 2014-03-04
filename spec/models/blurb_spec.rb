require "spec_helper"

describe Blurb do
  describe "#save" do
    context "when a blurb is made active" do
      it "should make all other blurbs inactive" do
        old_blurb = FactoryGirl.create(:blurb, active: true)
        blurb = FactoryGirl.create(:blurb, active: true)
        blurb.update_attributes(active: true)
        expect(old_blurb.reload.active?).to be_false
      end
    end
  end
end
