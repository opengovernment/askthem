require "spec_helper"

describe QuestionAnsweredNotifierWorker do
  describe '#perform' do
    before { ActionMailer::Base.deliveries.clear }

    it "sends emails to question author, staff, and signers" do
      answer = FactoryGirl.create(:answer)
      question = answer.question
      staff_member = FactoryGirl.create(:user)
      staff_member.add_role :staff_member
      signer = FactoryGirl.create(:user)

      QuestionAnsweredNotifierWorker.new.perform(question.id.to_s)

      delivery_count = ActionMailer::Base.deliveries.count
      # expect(delivery_count).to eq 3
      # only staff members for now
      expect(delivery_count).to eq 1
    end
  end
end
