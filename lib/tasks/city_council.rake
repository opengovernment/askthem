namespace :city_council do

  def opengovernment_import
    Mongoid.override_session('opengovernment_import')
    yield
    Mongoid.override_session(nil)
  end

  desc 'Import City Council agendas from scraper mongo collection'
  task agendas: :environment do

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

    session = Moped::Session.new([ "127.0.0.1:27017" ])
    session.use "opengovernment_import"
    agendas = session[:council_agendas].find()

    #clear out existing agendas
    Agenda.delete_all

    agendas.each do |agenda|

      # stuff date and time in to same field
      meeting_date = agenda['Meeting Date']['label'].strftime('%Y-%m-%d')
      meeting_time = Time.parse(agenda['Meeting Time']).strftime('%l:%M %p EST')
      meeting_datetime = DateTime.parse("#{meeting_date} #{meeting_time}")

      a = Agenda.create(
        meeting_date: meeting_datetime,
        name: agenda['Name'],
        location: agenda['Meeting Location'],
        agenda: agenda['Agenda'],
        minutes: agenda['Minutes']
      )
      puts "saved #{a.meeting_date} - #{a.name}"
    end
  end
end
