require "spec_helper"

describe PersonMailer do
  before { ActionMailer::Base.deliveries.clear }

  it ".notify_staff_new_from_twitter sends staff member e-mail" do
    twitter = "xyz"
    person = FactoryGirl.create(:person)
    person.write_attribute(:twitter_id, twitter)
    person.save!

    staff_member = FactoryGirl.create(:user)
    staff_member.add_role :staff_member

    PersonMailer.notify_staff_new_from_twitter(person).deliver
    last_email = ActionMailer::Base.deliveries.last

    expect(last_email.to).to eq [staff_member.email]
    expect(last_email.subject).to eq "New person added from Twitter: #{twitter}"
  end
end
