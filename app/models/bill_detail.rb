# Exists only because we blow away the `bills` collection regularly.
class BillDetail
  include Mongoid::Document

  # The bill's jurisdiction.
  field :state, type: String
  # The bill.
  field :bill_id, type: String
  # The bill's billId from Project VoteSmart.
  field :votesmart_id, type: String

  index(state: 1)
  index(bill_id: 1)
  index(votesmart_id: 1)

  validates_presence_of :state, :bill_id

  # @return [Metadatum] the jurisdiction in which the bill belongs
  def metadatum
    Metadatum.find_by_abbreviation(state)
  end

  # @todo delete if unnecessary with only 1 db
  # i.e. does belongs_to now work
  # @return [Bill] the bill
  def bill
    Bill.find(bill_id)
  end

  # @todo delete if unnecessary with only 1 db
  # i.e. does belongs_to now work (with delegate state to bill)
  # @param [Bill] bill a bill
  def bill=(bill)
    if bill
      self.bill_id = bill.id
      self.state = bill['state']
    else
      self.bill_id = nil
    end
  end
end
