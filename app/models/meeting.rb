class Meeting
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: "state"

  embeds_one :agenda
  embeds_one :minutes_document

  field :date_and_time, type: ActiveSupport::TimeWithZone
  field :name, type: String

  validates_presence_of :date_and_time, :name, :state

  def self.load_from_apis_for_jurisdiction(jurisdiction = nil)
    clear_existing_meetings(jurisdiction)

    results_for_jurisdiction(jurisdiction).each do |meeting_data|
      meeting = build_from_provided(meeting_data)
      meeting.save!
    end
  end

  private
  # @todo decide whether to keep 'all' handling
  def self.results_for_jurisdiction(jurisdiction = nil)
    if jurisdiction
      scraped_local_gov[:council_agendas].find("Municipality" => jurisdiction)
    else
      scraped_local_gov[:council_agendas].find
    end
  end

  # @example agenda object returned from the scraper
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
  def self.build_from_provided(attributes)
    meeting_name = attributes["Name"]
    if meeting_name.is_a?(Hash) && meeting_name["label"]
      meeting_name = meeting_name["label"]
    end

    meeting = Meeting.new(date_and_time: date_and_time_from(attributes),
                          name: meeting_name,
                          location: attributes["Meeting Location"],
                          # state == metadatum == jurisdiction
                          state: attributes["Municipality"])

    if attributes["Agenda"] && attributes["Agenda"]["url"]
      meeting.agenda = Agenda.new(url: attributes["Agenda"]["url"],
                                  full_text: attributes["Agenda"]["fulltext"])
    end

    if attributes["Minutes"] && attributes["Minutes"]["url"]
      puts attributes["Minutes"]["url"]
      meeting.minutes_document = MinutesDocument.new(url: attributes["Minutes"]["url"],
                                    full_text: attributes["Minutes"]["fulltext"])
    end
    meeting
  end

  # @todo don't assume EST, look up zone for jurisdiction
  def self.date_and_time_from(attributes)
    date = attributes["Meeting Date"].strftime("%Y-%m-%d")
    time = Time.zone.parse(attributes["Meeting Time"]).strftime("%l:%M %p EST")
    date_and_time = Time.zone.parse("#{date} #{time}")
  end

  def self.scraped_local_gov
    @scraped_local_gov ||= Mongoid.session(:scraped_local_gov)
  end

  def self.clear_existing_meetings(jurisdiction = nil)
    if jurisdiction
      Meeting.delete_all(state: jurisdiction)
    else
      Meeting.delete_all
    end
  end

  # class methods have do not honor private declaration
  private_class_methods = [:results_for_jurisdiction,
                           :build_from_provided,
                           :scraped_local_gov,
                           :clear_existing_meetings]
  private_class_method *private_class_methods
end
