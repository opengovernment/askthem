# requests specific helpers

# login helpers
# @see http://schneems.com/post/15948562424/speed-up-capybara-tests-with-devise
# for details

# gives us the login_as(@user) method when request object is not present
include Warden::Test::Helpers
Warden.test_mode!

# Will run the given code as the user passed in
def as_user(user = nil, &block)
  current_user = user || FactoryGirl.create(:user)
  login_as(current_user, :scope => :user)
  block.call if block.present?
  return self
end


def as_visitor(user = nil, &block)
  current_user = user || FactoryGirl.stub(:user)
  logout(:user)
  block.call if block.present?
  return self
end

def set_location_in_redis_for_ip
  attributes = { ip: "161.185.30.156",
    country_code: "US",
    country_name: "United States",
    region_code: "NY",
    region_name: "New York",
    city: "Brooklyn",
    zipcode: "11201",
    latitude: 40.6944,
    longitude: -73.9906,
    metro_code: "501",
    area_code: "718" }

  redis = Redis.new
  redis.set("161.185.30.156",
            Marshal.dump(Geocoder::Result::Freegeoip.new(attributes)))
end

RSpec.configure do |config|
  config.after(:each) { Warden.test_reset! }
  config.before(:each) { set_location_in_redis_for_ip }
end

# common helpers
def select_user_region_for(region)
  select(OpenGovernment::STATES.select { |_, v| v == region }.keys.first,
         from: "user_region")
end
