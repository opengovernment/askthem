class PeopleIdentifier
  attr_accessor :params, :people

  def initialize(params)
    @params = params
  end

  def people
    @people ||= if params[:email]
                  # annoying that you can't do case insensitive without a regex
                  Person.where(email: /\A#{Regexp.escape(params[:email])}\z/i)
                elsif params[:twitter_id]
                  people_from_twitter
                else
                  people_from_name_fragment
                end
  end

  private
  def people_from_twitter
    # exact match only to return local results over twitter
    regexp = /\A#{Regexp.escape(params[:twitter_id])}\z/i
    people = Person.where(twitter_id: regexp)
    return people if people.count > 0

    TwitterPersonService.new(params[:twitter_id]).people
  end

  def people_from_name_fragment
    Person.active.connected_to(params[:jurisdiction])
      .some_name_matches(params[:name_fragment])
  end
end
