require "spec_helper"

describe TwitterPersonService do
  let(:screen_name) { "NYTMinusContext" }

  describe "#matching_users" do
    it "returns matching twitter users for twitter_id" do
      expect(stubbed_request.matching_users.first.id).to eq 2189503302
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
      with(:body => {"screen_name"=>"NYTMinusContext"},
           :headers => {'Accept'=>'application/json',
             'Authorization'=>"Bearer #{ENV['TWITTER_APPLICATION_BEARER_TOKEN']}",
             'Content-Type'=>'application/x-www-form-urlencoded',
             'User-Agent'=>'Twitter Ruby Gem 5.5.1'}).
      to_return(:status => 200,
                :body => "[{\"id\":2189503302,\"id_str\":\"2189503302\",\"name\":\"NYT Minus Context\",\"screen_name\":\"NYTMinusContext\",\"location\":\"\",\"description\":\"All Tweets Verbatim From New York Times Content. Not Affiliated with New York Times. Follow @NYTPlusContext for context. NYTMinusContext@gmail.com\",\"url\":null,\"entities\":{\"description\":{\"urls\":[]}},\"protected\":false,\"followers_count\":9808,\"friends_count\":927,\"listed_count\":124,\"created_at\":\"Tue Nov 12 03:15:23 +0000 2013\",\"favourites_count\":3411,\"utc_offset\":-21600,\"time_zone\":\"Central Time (US & Canada)\",\"geo_enabled\":false,\"verified\":false,\"statuses_count\":1139,\"lang\":\"en\",\"status\":{\"created_at\":\"Tue Jan 07 19:49:15 +0000 2014\",\"id\":420643313864441856,\"id_str\":\"420643313864441856\",\"text\":\"just about any kind of bourbon pairs well with tea\",\"source\":\"<a href=\\\"http://bufferapp.com\\\" rel=\\\"nofollow\\\">Buffer</a>\",\"truncated\":false,\"in_reply_to_status_id\":null,\"in_reply_to_status_id_str\":null,\"in_reply_to_user_id\":null,\"in_reply_to_user_id_str\":null,\"in_reply_to_screen_name\":null,\"geo\":null,\"coordinates\":null,\"place\":null,\"contributors\":null,\"retweet_count\":32,\"favorite_count\":17,\"entities\":{\"hashtags\":[],\"symbols\":[],\"urls\":[],\"user_mentions\":[]},\"favorited\":false,\"retweeted\":false,\"lang\":\"en\"},\"contributors_enabled\":false,\"is_translator\":false,\"profile_background_color\":\"C0DEED\",\"profile_background_image_url\":\"http://abs.twimg.com/images/themes/theme1/bg.png\",\"profile_background_image_url_https\":\"https://abs.twimg.com/images/themes/theme1/bg.png\",\"profile_background_tile\":false,\"profile_image_url\":\"http://pbs.twimg.com/profile_images/378800000737186790/cf2fdc5e3dc3d9bd0e6233d271d4ca3b_normal.jpeg\",\"profile_image_url_https\":\"https://pbs.twimg.com/profile_images/378800000737186790/cf2fdc5e3dc3d9bd0e6233d271d4ca3b_normal.jpeg\",\"profile_banner_url\":\"https://pbs.twimg.com/profile_banners/2189503302/1384900032\",\"profile_link_color\":\"0084B4\",\"profile_sidebar_border_color\":\"C0DEED\",\"profile_sidebar_fill_color\":\"DDEEF6\",\"profile_text_color\":\"333333\",\"profile_use_background_image\":true,\"default_profile\":true,\"default_profile_image\":false,\"following\":null,\"follow_request_sent\":null,\"notifications\":null}]",
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
