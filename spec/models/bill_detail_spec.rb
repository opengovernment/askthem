require 'spec_helper'

describe BillDetail do
  %w(state bill_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  context 'with two sessions' do
    before :each do
      @metadatum = Metadatum.with(session: 'openstates').create(abbreviation: 'zz')
      @bill = Bill.with(session: 'openstates').create(state: 'zz')
      @record = BillDetail.with(session: 'default').create(bill: @bill)
    end

    it "should retrieve a metadatum from the OpenStates session for a bill detail in the default session" do
      BillDetail.with(session: 'default').last.metadatum.should == @metadatum
    end

    it "should retrieve a bill's details from the default session for a bill in the OpenStates session" do
      Bill.with(session: 'openstates').last.bill_detail.should == @record
    end

    it "should retrieve a bill from the OpenStates session for a bill detail in the default session" do
      BillDetail.with(session: 'default').last.bill.should == @bill
    end
  end
end
