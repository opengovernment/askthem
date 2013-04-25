# Billy
class Vote
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: 'state'

  # @todo Updated based on wiki
end
