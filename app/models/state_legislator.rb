require "legislator"
require "legislator_finder"

class StateLegislator < Person
  include Legislator
  extend LegislatorFinder
end
