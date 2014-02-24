class PeopleIdentifier
  attr_accessor :params, :people

  def initialize(params)
    @params = params
  end

  def people
    @people ||= if params[:email]
                  # annoying that you can't do case insensitive without a regex
                  Person.where(email: regexp_for(params[:email]))
                elsif params[:twitter_id]
                  people_from_twitter
                else
                  people_from_name_fragment
                end
  end

  private
  def regexp_for(string)
    /\A#{Regexp.escape(string)}\z/i
  end

  def people_from_twitter
    people = Person.any_of({ twitter_id: regexp_for(params[:twitter_id]) },
                           { additional_twitter_ids:
                             { "$in" => [params[:twitter_id].downcase] } })
    return people if people.count > 0

    TwitterPersonService.new(params[:twitter_id]).people
  end

  def people_from_name_fragment
    Person.active.connected_to(params[:jurisdiction])
      .some_name_matches(params[:name_fragment])
  end
end
