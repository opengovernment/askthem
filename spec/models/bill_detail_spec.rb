require 'spec_helper'

describe BillDetail do
  %w(state bill_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  context 'when in relation' do
    before :each do
      @metadatum = Metadatum.create(abbreviation: 'zz')
      @bill = Bill.create(state: 'zz')
      @record = BillDetail.create(bill: @bill)
    end

    it 'should retrieve a metadatum for a bill detail' do
      BillDetail.last.metadatum.should == @metadatum
    end

    it "should retrieve a bill's bill detail" do
      Bill.last.bill_detail.should == @record
    end

    it "should retrieve the bill detail's bill" do
      BillDetail.last.bill.should == @bill
    end
  end
end
