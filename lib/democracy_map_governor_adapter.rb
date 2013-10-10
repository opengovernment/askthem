# Democracy Map governor record handling
class DemocracyMapGovernorAdapter < SimpleDelegator
  def run(data)
    data.each do |key, value|
      case key
      when "title"
        write_attribute :political_position, value.downcase
      when "name_given"
        self.first_name = value
      when "name_family"
        self.last_name = value
      when "name_full"
        self.full_name = value
      when "social_media"
        set_social_media(value)
      when "url_photo"
        self.photo_url = value
      else
        write_attribute key.to_sym, value
      end
    end
    self.write_attribute :active, true
  end

  private
  # @todo handle other types
  def set_social_media(value)
    return unless value

    twitter_id = value.inject("") do |result, hash|
      result = hash["username"] if hash["type"] == "twitter"
    end

    self.write_attribute(:twitter_id, twitter_id)
  end
end
