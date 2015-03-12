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
                elsif params[:person_id]
                  Person.where(id: params[:person_id])
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
    # get list of abbreviations within state
    # e.g. ny ny-new-york ny-brooklyn
    # rather than only connected to current jurisdiction,
    # use "in" on abbreviations
    state = params[:jurisdiction].split("-").first
    in_state = Metadatum.where(abbreviation: /^#{state}/).collect(&:id)

    Person.active.in(state: in_state).some_name_matches(params[:name_fragment])
  end
end
