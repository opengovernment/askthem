# @todo stub
class Signature
  include Mongoid::Document
  include Mongoid::Timestamps
  store_in session: 'default'

  belongs_to :user
  belongs_to :question

  validates_presence_of :user_id, :question_id
  validates_uniqueness_of :user_id, scope: :question_id

  # @todo copy address onto signature, in case user changes address
end
