class TwitterPersonAdapter < SimpleDelegator
  def run(twitter_user)
    data = twitter_user.as_json

    data.each do |key, value|
      case key
      when :id, :status
        next
      when :screen_name
        write_attribute :twitter_id, value
      when :name
        self.full_name = value if value
      when :profile_image_url
        self.photo_url = value
      when :verified
        write_attribute :twitter_verified, value
      else
        write_attribute(key, value) if value
      end
      self.state = Metadatum::Unaffiliated::ABBREVIATION
    end
  end
end
