require "spec_helper"

shared_examples "notifier of submitting user" do
  it "sends notification" do
    @recipients ||= ActionMailer::Base.deliveries.collect(&:to).flatten.uniq
    expect(@recipients.include?(identity.user.email)).to be_true
  end
end

shared_examples "event to transition state" do |state|
  it "transitions to #{state}" do
    expect(identity.send("#{state}?")).to be_true
  end

  it "has inspected_at set" do
    expect(identity.inspected_at.to_date).to eq Time.zone.now.to_date
  end

  it "has inspector set" do
    expect(identity.inspector.class).to eq User
  end

  it_behaves_like "notifier of submitting user"
end

describe Identity do
  let(:identity) { FactoryGirl.create(:identity) }

  # this may change if we add support for matching on twitter_id, etc.
  it "validates user.email against person.email" do
    user = identity.user
    user.email = 'xxx'
    user.save
    expect(identity.valid?).to be_false
  end

  describe "#inspection_event" do
    before do
      identity.status = "being_inspected"
    end

    it "runs passed in inspection workflow event" do
      identity.inspection_event("reject!", identity.user)
      expect(identity.rejected?).to be_true
    end

    it "raises error if not a valid inspection workflow event" do
      expect { identity.inspection_event("xyz", identity.user) }
        .to raise_error Identity::InvalidWorkflowEvent
    end
  end

  context "when triggering events on identity" do
    before { ActionMailer::Base.deliveries.clear }

    describe "#submit!" do
      before do
        @staff_member = FactoryGirl.create(:user)
        @staff_member.add_role :staff_member

        identity.submit!
      end

      it "transitions to being_inspected" do
        expect(identity.being_inspected?).to be_true
      end

      context "notifications" do
        before :each do
          @recipients = ActionMailer::Base.deliveries.collect(&:to).flatten.uniq
        end

        it_behaves_like "notifier of submitting user"

        it "sends notification to staff members" do
          expect(@recipients.include?(@staff_member.email)).to be_true
        end
      end
    end

    context "when already being_inspected" do
      let(:inspector) { FactoryGirl.create(:user) }

      before { identity.status = 'being_inspected' }

      describe "#verify!" do
        before { identity.verify!(inspector) }

        it_behaves_like "event to transition state", "verified"
      end

      describe "#reject!" do
        before { identity.reject!(inspector) }

        it_behaves_like "event to transition state", "rejected"
      end
    end
  end
end
