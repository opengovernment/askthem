require "spec_helper"

describe TwitterPersonService do
  let(:screen_name) { "SenSanders" }

  describe "#matching_users" do
    it "returns matching twitter users for twitter_id" do
      expect(stubbed_request.matching_users.first.id).to eq 29442313
    end

    context "when there is not a matching twitter user" do
      it "returns no results rather than raise not found" do
        expect(stubbed_no_match_request.matching_users).to eq Array.new
      end
    end
  end

  describe "#people" do
    context "when there is not already a matching person" do
      it "creates matching people for twitter_id" do
        first_person = stubbed_request.people.first

        expect(first_person.is_a?(Person)).to be_true
        expect(first_person.persisted?).to be_true
        expect(first_person.twitter_id).to eq screen_name
      end
    end

    context "when there is already a matching person" do
      it "returns matching people for twitter_id" do
        existing_person = FactoryGirl.create(:person)
        existing_person.write_attribute(:twitter_id, screen_name)
        existing_person.save!

        expect(stubbed_request.people.first).to eq existing_person
      end
    end
  end

  def stubbed_request
    stub_twitter_response
    TwitterPersonService.new(screen_name)
  end

  def stubbed_no_match_request
    stub_twitter_404_response
    TwitterPersonService.new("nonexistenttwitter")
  end

  def stub_twitter_response
    stub_request(:post, "https://api.twitter.com/1.1/users/lookup.json").
      with(:body => {"screen_name"=>"SenSanders"},
           :headers => {'Accept'=>'application/json',
             'Authorization'=>"Bearer #{ENV['TWITTER_APPLICATION_BEARER_TOKEN']}",
             'Content-Type'=>'application/x-www-form-urlencoded',
             'User-Agent'=>'Twitter Ruby Gem 5.5.1'}).
      to_return(:status => 200,
                :body => "[{\"id\":29442313,\"id_str\":\"29442313\",\"name\":\"Bernie Sanders\",\"screen_name\":\"SenSanders\",\"location\":\"Vermont/DC\",\"description\":\"Sen. Bernie Sanders is the longest serving independent in congressional history. Tweets ending in -B are from Bernie, and all others are from a staffer.\",\"url\":\"http://t.co/i65zfLVok4\",\"entities\":{\"url\":{\"urls\":[{\"url\":\"http://t.co/i65zfLVok4\",\"expanded_url\":\"http://www.sanders.senate.gov/\",\"display_url\":\"sanders.senate.gov\",\"indices\":[0,22]}]},\"description\":{\"urls\":[]}},\"protected\":false,\"followers_count\":195156,\"friends_count\":1268,\"listed_count\":6801,\"created_at\":\"Tue Apr 07 13:02:35 +0000 2009\",\"favourites_count\":2,\"utc_offset\":-18000,\"time_zone\":\"Eastern Time (US & Canada)\",\"geo_enabled\":true,\"verified\":true,\"statuses_count\":8423,\"lang\":\"en\",\"status\":{\"created_at\":\"Wed Jan 15 21:07:34 +0000 2014\",\"id\":423562124510502912,\"id_str\":\"423562124510502912\",\"text\":\"Read Sen. Sanders' response to the ruling on Verizon v. FCC: http://t.co/9MqJXNjXAU #SaveNetNeutrality http://t.co/jOHV9d137H\",\"source\":\"web\",\"truncated\":false,\"in_reply_to_status_id\":null,\"in_reply_to_status_id_str\":null,\"in_reply_to_user_id\":null,\"in_reply_to_user_id_str\":null,\"in_reply_to_screen_name\":null,\"geo\":null,\"coordinates\":null,\"place\":null,\"contributors\":null,\"retweet_count\":157,\"favorite_count\":76,\"entities\":{\"hashtags\":[{\"text\":\"SaveNetNeutrality\",\"indices\":[84,102]}],\"symbols\":[],\"urls\":[{\"url\":\"http://t.co/9MqJXNjXAU\",\"expanded_url\":\"http://www.sanders.senate.gov/newsroom/press-releases/sanders-statement-on-verizon-v-fcc\",\"display_url\":\"sanders.senate.gov/newsroom/press\\u2026\",\"indices\":[61,83]}],\"user_mentions\":[],\"media\":[{\"id\":423562124518891520,\"id_str\":\"423562124518891520\",\"indices\":[103,125],\"media_url\":\"http://pbs.twimg.com/media/BeDLghRCIAARRIT.png\",\"media_url_https\":\"https://pbs.twimg.com/media/BeDLghRCIAARRIT.png\",\"url\":\"http://t.co/jOHV9d137H\",\"display_url\":\"pic.twitter.com/jOHV9d137H\",\"expanded_url\":\"http://twitter.com/SenSanders/status/423562124510502912/photo/1\",\"type\":\"photo\",\"sizes\":{\"medium\":{\"w\":600,\"h\":600,\"resize\":\"fit\"},\"thumb\":{\"w\":150,\"h\":150,\"resize\":\"crop\"},\"small\":{\"w\":340,\"h\":340,\"resize\":\"fit\"},\"large\":{\"w\":900,\"h\":900,\"resize\":\"fit\"}}}]},\"favorited\":false,\"retweeted\":false,\"possibly_sensitive\":false,\"lang\":\"en\"},\"contributors_enabled\":false,\"is_translator\":false,\"profile_background_color\":\"100805\",\"profile_background_image_url\":\"http://a0.twimg.com/profile_background_images/378800000134982298/-QwGH7h-.jpeg\",\"profile_background_image_url_https\":\"https://si0.twimg.com/profile_background_images/378800000134982298/-QwGH7h-.jpeg\",\"profile_background_tile\":false,\"profile_image_url\":\"http://pbs.twimg.com/profile_images/1473648414/Picture_3_normal.png\",\"profile_image_url_https\":\"https://pbs.twimg.com/profile_images/1473648414/Picture_3_normal.png\",\"profile_banner_url\":\"https://pbs.twimg.com/profile_banners/29442313/1354111140\",\"profile_link_color\":\"92110D\",\"profile_sidebar_border_color\":\"FFFFFF\",\"profile_sidebar_fill_color\":\"D6CCB6\",\"profile_text_color\":\"304562\",\"profile_use_background_image\":true,\"default_profile\":false,\"default_profile_image\":false,\"following\":null,\"follow_request_sent\":null,\"notifications\":null}]",
                :headers => {})
  end

  def stub_twitter_404_response
    stub_request(:post, "https://api.twitter.com/1.1/users/lookup.json").
      with(:body => {"screen_name"=>"nonexistenttwitter"},
           :headers => {'Accept'=>'application/json',
             'Authorization'=>"Bearer #{ENV['TWITTER_APPLICATION_BEARER_TOKEN']}",
             'Content-Type'=>'application/x-www-form-urlencoded',
             'User-Agent'=>'Twitter Ruby Gem 5.5.1'}).
      to_return(:status => 404,
                :body => "",
                :headers => {})
  end
end
