# @todo stub
class Question
  include Mongoid::Document
  store_in session: 'default'

  field :title, type: String
end
