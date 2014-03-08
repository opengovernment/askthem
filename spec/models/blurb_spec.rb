require "spec_helper"

describe Blurb do
  describe "#save" do
    context "when a homepage blurb is made active" do
      it "should make all other homepage blurbs inactive" do
        old_blurb = FactoryGirl.create(:blurb, active: true)
        blurb = FactoryGirl.create(:blurb, active: true)
        blurb.update_attributes(active: true)
        expect(old_blurb.reload.active?).to be_false
      end

      it "should not make non-homepage blurbs inactive" do
        old_blurb = FactoryGirl.create(:blurb, active: true, target_url: "x")
        blurb = FactoryGirl.create(:blurb, active: true)
        blurb.update_attributes(active: true)
        expect(old_blurb.reload.active?).to be_true
      end
    end

    context "when a blurb for a specific url is made active" do
      it "should make all other blurbs for target_url inactive" do
        old_blurb = FactoryGirl.create(:blurb, active: true, target_url: "x")
        blurb = FactoryGirl.create(:blurb, active: true, target_url: "x")
        blurb.update_attributes(active: true)
        expect(old_blurb.reload.active?).to be_false
      end

      it "should not make homepage blurbs inactive" do
        old_blurb = FactoryGirl.create(:blurb, active: true)
        blurb = FactoryGirl.create(:blurb, active: true, target_url: "x")
        blurb.update_attributes(active: true)
        expect(old_blurb.reload.active?).to be_true
      end
    end
  end
end
