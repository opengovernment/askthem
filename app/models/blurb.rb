# simple snippets of content meant for use on homepage & maybe other spots
class Blurb
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :user

  field :headline, type: String
  field :body, type: String
  field :active, type: Boolean, default: false

  # if "/" then blurb is for homepage
  field :target_url, type: String, default: "/"

  # only one active blurb at a time
  after_save :make_all_others_inactive, if: :active?

  validates_presence_of :headline, :body

  scope :active, where(active: true)

  private
  def make_all_others_inactive
    other_blurbs = self.class.where(active: true).nin(id: [id])

    if target_url
      other_blurbs = other_blurbs.where(target_url: target_url)
    else
      other_blurbs = other_blurbs.where(target_url: nil)
    end

    other_blurbs.each do |record|
      record.update_attributes(active: false)
    end
  end
end
