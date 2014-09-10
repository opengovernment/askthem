require "twitter_person_adapter"

class TwitterPersonService
  attr_accessor :client, :screen_name, :matching_users, :people

  def initialize(screen_name, persist_people = true)
    self.screen_name = screen_name
    self.client = Twitter::REST::Client.new(config)

    matching_users.each do |match|
      self.people << find_or_create_person_from(match) if persist_people
    end
  end

  # twitter matches are only exact,
  # but we keep the api as if many results for consistency with other services
  # must be verified
  def matching_users
    @matching_users ||= client.users(screen_name).select(&:verified)
  rescue Twitter::Error::NotFound
    @matching_users = []
  end

  def people
    @people ||= []
  end

  private
  def config
    { consumer_key: ENV['TWITTER_APPLICATION_CONSUMER_KEY'],
      consumer_secret: ENV['TWITTER_APPLICATION_CONSUMER_SECRET'],
      bearer_token: ENV['TWITTER_APPLICATION_BEARER_TOKEN'],
    }
  end

  def find_or_create_person_from(twitter_user)
    person = Person.where(twitter_id: twitter_user.screen_name).first ||
      Person.new
    return person if person.persisted?

    adapter = TwitterPersonAdapter.new(person)
    person = person.load_from_apis!(twitter_user, adapter: adapter)

    UnaffiliatedPersonTidyWorker.perform_in(24.hours, person.id.to_s)
    person
  end
end
