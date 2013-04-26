# Exists only because we blow away the `people` collection regularly.
# @note Based on Popolo.
class PersonDetail
  include Mongoid::Document
  store_in session: 'default' # @see https://github.com/mongoid/mongoid/pull/2909

  belongs_to :person, index: true # @todo does this work in both directions/environments?

  # Links to pages about this person, e.g. Wikipedia, or to accounts this
  # person has on other websites, e.g. Twitter.
  embeds_many :links

    # The person's extended biography.
  field :biography
end