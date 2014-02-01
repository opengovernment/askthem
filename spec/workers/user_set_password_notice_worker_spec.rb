require "spec_helper"

describe UserSetPasswordNoticeWorker do
  describe '#perform' do
    before { ActionMailer::Base.deliveries.clear }

    context "when user is confirmed and has placeholder password" do
      it "sends email asking user to set their password" do
        user = FactoryGirl.create(:user)
        user.confirm!
        user.password_is_placeholder = true
        user.save!

        UserSetPasswordNoticeWorker.new.perform(user.id)

        last_email = ActionMailer::Base.deliveries.last

        expect(last_email.to).to eq [user.email]
        expect(last_email.subject).to eq "Set your AskThem.io password"
      end
    end
  end
end
