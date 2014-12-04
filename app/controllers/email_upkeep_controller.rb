class EmailUpkeepController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def index
    raise unless params["Message"].present?

    # would be good to do further scrutiny of incoming json for security reasons
    recipient_email_addresses_from(params["Message"]).each do |email_address|
      logger.debug("what is email: #{email_address}")
      user = User.where(email: email_address).first
      user.update_attributes(email_is_disabled: true) if user
    end

    render nothing: true, status: 204
  end

  private

  def recipient_email_addresses_from(message_data)
    bounce = message_data.fetch("bounce")
    recipients = bounce.fetch("bouncedRecipients", [])
    recipients.inject([]) do |email_addresses, recipient|
      email_addresses << recipient["emailAddress"] if recipient["emailAddress"]
    end
  end
end
