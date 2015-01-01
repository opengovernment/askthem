require 'spec_helper'

describe EmailUpkeepController do
  describe "POST index" do
    context "when a subscription confirmation is sent" do
      it "should request subscription url and end processing", vcr: true do
        request.env["RAW_POST_DATA"]  = subscription_confirmation_params.to_json
        post :index, format: :json
        expect(response.code).to eq "204"
      end

      def subscription_confirmation_params
        { "Type" => "SubscriptionConfirmation",
          "SubscribeURL" => "http://example.com/" }
      end
    end

    context "when a valid json bounce object is sent" do
      before do
        @original_aws_sns_topic_arns = ENV["AWS_SNS_TOPIC_ARNS"]
        ENV["AWS_SNS_TOPIC_ARNS"] = "arn:aws:sns:us-east-1:535280530538:email_bounces"
      end

      it "should update corresponding user's email_is_disabled to true" do
        user = FactoryGirl.create(:user, email: "foo@example.com")

        request.env["RAW_POST_DATA"] = valid_bounce.to_json
        post :index, format: :json

        expect(response.code).to eq "204"
        expect(user.reload.email_is_disabled).to eq true
      end

      after do
        ENV["AWS_SNS_TOPIC_ARNS"] = @original_aws_sns_topic_arns
      end

      def valid_bounce
        {
          "Type" => "Notification",
          "MessageId" => "1a509979-dede-56ab-9jbf-d36983a66cba",
          "TopicArn" => "arn:aws:sns:us-east-1:535280530538:email_bounces",
          "Message" => { "notificationType" => "Bounce",
            "bounce" => { "bounceSubType" => "General",
              "bounceType" => "Transient",
              "reportingMTA" => "dsn; aws-ses-mta-svc-iad-1a-i-e6e8e98c.us-east-1.amazon.com",
              "bouncedRecipients" => [{ "emailAddress" => "foo@example.com",
                                        "status" => "4.4.7",
                                        "diagnosticCode" => "smtp; 550 4.4.7 Message expired - unable to deliver in 840 minutes.<421 4.4.0 Unable to lookup DNS for example.com>",
                                        "action" => "failed" }],
              "timestamp" => "2013-05-17T16:26:31.000Z",
              "feedbackId" => "0000013eb3506972-88979901-bf0e-31e4-b280-c390f3ef4cd7-000000" },
            "mail" => { "timestamp" => "2013-05-17T02:02:43.000Z",
              "source" => "The sender <sender@example.com>",
              "messageId" => "0000013eb0399348-00ca18d9-5995-4898-17a6-26f5ea0dbea3-000000",
              "destination" => ["foo@example.com", "bar@example.com"] } },
          "Timestamp" => "2013-05-17T16:26:32.155Z",
          "SignatureVersion" => "1",
          "Signature" => "qZl8NLEsr6R0g60V3D8WfWOcJmSahLAwHAIMaPgjBQMBuDmQB8mfaKrHTjnA4UWYVePc2xUfP3R1lmIPNQJ5Ug/qRZivrcumJkuMkOk3+KKFwD0hduTltQ8XhMgXFhLGC7qQ6XM3mKilrYvukz8Erk6E4JXOQEtCG0sp18R1g4M=",
          "SigningCertURL" => "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe72b5f29f86de52f.pem",
          "UnsubscribeURL" => "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:545230530538:email_bounces:72f38fee-9106-4423-9fd8-b93631723137"
        }
      end
    end

    context "when an invalid request is made" do
      it "should return an error" do
        expect { post(:index, format: :json) }.to raise_error
      end
    end
  end
end
