class EmailUpkeepController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def index
    raise "Must contain SNS Message" unless params["Message"].present?
    unless valid_topic_arns.include?(params["TopicArn"])
      raise "Must come from valid AWS SNS queue"
    end

    # would be good to do further scrutiny of incoming json for security reasons
    recipient_email_addresses_from(params["Message"]).each do |email_address|
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

  def valid_topic_arns
    ENV.fetch("AWS_SNS_TOPIC_ARNS", String.new).split(",")
  end
end
