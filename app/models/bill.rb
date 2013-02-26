require 'ostruct'

# Billy
class Bill
  include Mongoid::Document

  # For querying bills related to a committee.
  index('actions.related_entities.id' => 1)
  # For querying a state's current bills.
  index(state: 1, _current_session: 1, 'action_dates.last' => -1)

  # @param [Integer] limit the number of sponsors to return
  # @return [Array] the people and committees sponsoring the bill
  def people_and_committee_sponsors(limit = 0)
    sponsors = read_attribute(:sponsors)
    sponsors = sponsors.first(limit) if limit.nonzero?

    map = {}

    # Get all the legislator sponsors in a single query.
    ids = sponsors.select{|x| x['leg_id']}.map{|x| x['leg_id']}
    unless ids.empty?
      Person.where(_id: {'$in' => ids}).each do |document|
        map[document.id] = document
      end
    end

    # Get all the committee sponsors in a single query.
    ids = sponsors.select{|x| x['committee_id']}.map{|x| x['committee_id']}
    unless ids.empty?
      Committee.where(_id: {'$in' => ids}).each do |committee|
        map[document.id] = document
      end
    end

    # Maintain the sponsors' order.
    sponsors.map do |sponsor|
      document = map[sponsor['leg_id'] || sponsor['committee_id']] || OpenStruct.new(name: sponsor['name'])
      document['type'] = sponsor['type']
      document
    end
  end

  # @return [Array] the major actions sorted by date
  def dates
    read_attribute(:action_dates).to_a.select{|_,date| date}.sort_by{|_,date| date}
  end

  def questions # @todo
    []
  end

  def answers # @todo
    []
  end
end
