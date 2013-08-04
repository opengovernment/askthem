class Meeting
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: 'state'

  field :meeting_date, type: String
  field :name, type: String
  field :municipality, type: String

  validates_presence_of :meeting_date, :name, :municipality

  # Return the agenda for this meeting
  def agenda
    MeetingAgenda.where(meeting_id: id).first
  end

  # Return the minutes for this meeting
  def minutes
    MeetingMinutes.where(meeting_id: id).first
  end

  def self.load_from_apis_for_jurisdiction(municipality=nil) 
    session = scraped_local_gov
    if municipality
      meetings = session[:council_agendas].find({municipality: municipality})

      #clear out existing agendas
      Meeting.delete_all({municipality: municipality})

    else # get em all
      meetings = session[:council_agendas].find()

      #clear out existing agendas
      Meeting.delete_all

    end

    # Example agenda object returned from the scraper
    # {
    #   u'Meeting Date': {
    #     'url': u'javascript:void(0);', 
    #     'label': datetime.datetime(2013, 6, 20, 0, 0)
    #   }, 
    #   u'Meeting Time': u'9:00 AM', 
    #   u'Name': u'Committee of the Whole', 
    #   u'Meeting Location': u'Room 400', 
    #   'fulltext': 'Public Hearing NoticeCity of PhiladelphiaThe Committee of the Whole of the Council of the City of Philadelphia will hold a Public Hearing on Thursday, June 20, 2013, at 9:00 AM, in Room 400, City Hall, to hear testimony on the following items:Resolution appointing Mjenzi Traylor to the Board of Directors of the Germantown Special Services District of Philadelphia.130504Resolution appointing Matt Canno to the Board of Directors of the Germantown Special Services District of Philadelphia.130505Resolution appointing Joseph Martin to the Board of Directors of the Germantown Special Services District of Philadelphia.130506Resolution appointing Joseph Waldo to the Board of Directors of the Germantown Special Services District of Philadelphia.130507Resolution appointing Joseph Corrigan to the Board of Directors of the Germantown Special Services District of Philadelphia.130508Resolution appointing Greg Peil to the Board of Directors of the Germantown Special Services District of Philadelphia.130509Resolution appointing Barbara Hogue to the Board of Directors of the Germantown Special Services District of Philadelphia.130510Copies of the foregoing items are available in the Office of the Chief Clerk of the Council, Room 402, City Hall.Immediately following the public hearing, a meeting of the Committee of the Whole, open to the public, will be held to consider the action to be taken on the above listed items.Michael DeckerChief ClerkCity of Philadelphia- 1 -\x0c', 
    #   u'Agenda': {
    #     'url': u'View.ashx?M=A&ID=248602&GUID=2D23A8B0-4FB3-4EF2-A957-C6FD8FF9BDAA', 
    #     'label': u'Agenda'
    #   }, 
    #   u'Minutes': {
    #     'url': u'View.ashx?M=A&ID=248602&GUID=2D23A8B0-4FB3-4EF2-A957-C6FD8FF9BDAA', 
    #     'label': u'Minutes'
    #   }, 
    # }

    meetings.each do |meeting_data|

      # stuff date and time in to same field
      meeting_date = meeting_data['Meeting Date']['label'].strftime('%Y-%m-%d')
      meeting_time = Time.parse(meeting_data['Meeting Time']).strftime('%l:%M %p EST')
      meeting_datetime = DateTime.parse("#{meeting_date} #{meeting_time}")

      meeting = Meeting.create(
        meeting_date: meeting_datetime,
        name: meeting_data['Name'],
        location: meeting_data['Meeting Location'],
        municipality: meeting_data['Municipality']
      )
      
      if (meeting_data['Agenda']['url'])
        agenda = MeetingAgenda.create(
          meeting_id: meeting.id,
          url: meeting_data['Agenda']['url'],
          fulltext: meeting_data['Agenda']['fulltext']
        )
        # puts "saved agenda"
      end

      if (meeting_data['Minutes']['url'])
        minutes = MeetingMinutes.create(
          meeting_id: meeting.id,
          url: meeting_data['Minutes']['url'],
          fulltext: meeting_data['Minutes']['fulltext']
        )
        # puts "saved minutes"
      end

      # puts "saved #{meeting.meeting_date} - #{meeting.name}"
    end

  end

  private
  def self.scraped_local_gov
    session = Moped::Session.new([ "127.0.0.1:27017" ])
    session.use "scraped_local_gov"
    session
  end

  # class methods have do not honor private declaration
  private_class_methods = [:scraped_local_gov]
  private_class_method *private_class_methods

end
