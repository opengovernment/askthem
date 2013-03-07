require 'ostruct'

# Billy
class Bill
  include Mongoid::Document

  DATE_ORDER = {
    'lower' => [
      'first',
      'passed_lower',
      'passed_upper',
      'signed',
      'last',
    ],
    'upper' => [
      'first',
      'passed_upper',
      'passed_lower',
      'signed',
      'last',
    ]
  }

  OTHER_CHAMBER = {
    'lower' => 'upper',
    'upper' => 'lower',
  }

  # Bills related to a committee or legislator.
  index('actions.related_entities.id' => 1)
  # Bills with an action by a committee.
  index('actions.committee' => 1)
  # Bills sponsored by a committee.
  index('sponsors.committee_id' => 1)
  # A state's current bills.
  index(state: 1, _current_session: 1, 'action_dates.last' => -1)

  def jurisdiction
    @jurisdiction ||= Metadatum.find(read_attribute(:state))
  end

  # @return [Array] the major actions sorted by date
  def dates
    @dates ||= begin
      dates = read_attribute(:action_dates).to_a

      # Remove extra chambers.
      chamber = read_attribute(:chamber)
      if jurisdiction.chambers.size == 1
        dates.delete_at(dates.index{|action,_| action.include?(OTHER_CHAMBER[chamber])})
      end

      # Sort the dates appropriately.
      order = DATE_ORDER[chamber]
      dates.sort do |(a,_),(b,_)|
        order.index(a) <=> order.index(b)
      end
    end
  end

  # Returns the sponsors of the bill.
  #
  # @param [Integer] limit the number of sponsors to return
  # @return [Array] the people and committees sponsoring the bill
  def people_and_committee_sponsors(limit = 0)
    sponsors = read_attribute(:sponsors)
    sponsors = sponsors.first(limit) if limit.nonzero?

    map = instantiate_sponsors(sponsors, Person, 'leg_id').merge(instantiate_sponsors(sponsors, Committee, 'committee_id'))

    # Maintain the sponsors' order. Not every bill has foreign keys for its
    # sponsors, e.g. WIB00000879.
    sponsors.map do |sponsor|
      map[sponsor['leg_id'] || sponsor['committee_id']] || OpenStruct.new(name: sponsor['name'], type: sponsor['type'])
    end
  end

  # Returns a list of legislators sponsoring the bill.
  #
  # @param [Integer] limit the number of sponsors to return
  # @return [Array] the legislators sponsoring the bill
  # @note Use only if you want to exclude committees.
  def person_sponsors(limit = 0)
    sponsors = read_attribute(:sponsors).select{|x| x['leg_id']}
    sponsors = sponsors.first(limit) if limit.nonzero?
    instantiate_sponsors(sponsors, Person, 'leg_id').values
  end

  # Returns a list of committees sponsoring the bill.
  #
  # @param [Integer] limit the number of sponsors to return
  # @return [Array] the committees sponsoring the bill
  # @note Use only if you want to exclude legislators.
  def committee_sponsors(limit = 0)
    sponsors = read_attribute(:sponsors).select{|x| x['committee_id']}
    sponsors = sponsors.first(limit) if limit.nonzero?
    instantiate_sponsors(sponsors, Committee, 'committee_id').values
  end

  def questions # @todo
    []
  end

  def answers # @todo
    []
  end

private

  def instantiate_sponsors(sponsors, klass, field)
    map = {}

    # Get all the legislator sponsors in a single query.
    ids_and_types = Hash[*sponsors.select{|x| x[field]}.map{|x| [x[field], x['type']]}.flatten]
    unless ids_and_types.empty?
      klass.where(_id: {'$in' => ids_and_types.keys}).each do |document|
        document['type'] = ids_and_types[document.id]
        map[document.id] = document
      end
    end

    map
  end
end
