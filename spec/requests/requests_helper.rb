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

RSpec.configure do |config|
  config.after(:each) { Warden.test_reset! }
end
