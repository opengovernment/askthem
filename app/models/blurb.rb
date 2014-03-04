# simple snippets of content meant for use on homepage & maybe other spots
class Blurb
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :user

  field :headline, type: String
  field :body, type: String
  field :active, type: Boolean, default: false

  # only one active blurb at a time
  after_save :make_all_others_inactive, if: :active?

  validates_presence_of :headline, :body

  private
  def make_all_others_inactive
    self.class.where(active: true).nin(id: [id]).each do |record|
      record.update_attributes(active: false)
    end
  end
end
