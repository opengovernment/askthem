class Agenda
  include Mongoid::Document

  belongs_to :metadatum, foreign_key: 'state'

end
