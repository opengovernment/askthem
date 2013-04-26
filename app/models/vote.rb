# Billy
class Vote
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: 'state'
  belongs_to :bill

  # Returns the people who voted.
  def people
    # @todo
  end
end
