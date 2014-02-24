class RegisteredRedirect
  include Mongoid::Document
  include Mongoid::Timestamps

  field :from_url_pattern, type: String
  field :to_url_pattern, type: String
  field :status_code, type: Integer, default: 301

  validates_presence_of :from_url_pattern, :to_url_pattern

  # takes a request and returns last (latest) registered_redirect
  # that has a matching from_url_pattern
  # most complete match takes precedence
  def self.match(request)
    full_path = request.fullpath.downcase

    any_of({ from_url_pattern: full_path },
           { from_url_pattern: /#{full_path}/i })

  end

  # for now this simply returns to_url_pattern
  # but in the future it will handle more complex replacements
  def new_url_from(request)
    to_url_pattern
  end
end
