class PeopleIdentifier
  attr_accessor :params, :people

  def initialize(params)
    @params = params
  end

  def people
    @people ||= if params[:email]
                  # annoying that you can't do case insensitive queries without a regex
                  Person.where(email: /^#{params[:email]}$/i)
                elsif params[:twitter_id]
                  people_from_twitter
                else
                  people_from_name_fragment
                end
  end

  private
  def people_from_twitter
    people = Person.where(twitter_id: /^#{params[:twitter_id]}/i)
    return people if people.count > 0

    TwitterPersonService.new(params[:twitter_id]).people
  end

  def people_from_name_fragment
    Person.active.connected_to(params[:jurisdiction])
      .some_name_matches(params[:name_fragment])
  end
end
