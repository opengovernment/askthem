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

  # @return [Metadatum] the bill's jurisdiction
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
  # @param [Hash] opts optional arguments
  # @option opts [Integer] :limit the number of sponsors to return
  # @option opts [Symbol] :only the type of sponsors to return
  # @return [Array] the people and committees sponsoring the bill
  def people_and_committee_sponsors(opts = {})
    sponsors = read_attribute(:sponsors)
    case opts[:only]
    when :people
      sponsors.select!{|x| x['leg_id']}
    when :committees
      sponsors.select!{|x| x['committee_id']}
    end
    sponsors = sponsors.first(opts[:limit]) if opts.key?(:limit)

    documents_by_id = {}

    # Get all the legislator sponsors in a single query.
    ids = sponsors.select{|x| x['leg_id']}.map{|x| x['leg_id']}
    unless ids.empty?
      Person.where(_id: {'$in' => ids}).each do |document|
        documents_by_id[document.id] = document
      end
    end

    # Get all the committee sponsors in a single query.
    ids = sponsors.select{|x| x['committee_id']}.map{|x| x['committee_id']}
    unless ids.empty?
      Committee.where(_id: {'$in' => ids}).each do |document|
        documents_by_id[document.id] = document
      end
    end

    # Maintain the sponsors' order. Not every bill has foreign keys for its
    # sponsors, e.g. WIB00000879.
    sponsors.map do |sponsor|
      document = documents_by_id[sponsor['leg_id'] || sponsor['committee_id']]
      if document
        document['type'] = sponsor['type']
      else
        document = OpenStruct.new(name: sponsor['name'], type: sponsor['type'])
      end
      document
    end
  end

  def questions # @todo
    []
  end

  def answers # @todo
    []
  end
end
