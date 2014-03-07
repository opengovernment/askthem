require 'spec_helper'

describe Answer do
  %w(text question_id user_id).each do |attribute|
    it {should validate_presence_of attribute}
  end

  describe "#save" do
    context "when an answer is made featured" do
      it "should make all other answers unfeatured" do
        old_answer = FactoryGirl.create(:answer, featured: true)
        answer = FactoryGirl.create(:answer, featured: true)
        answer.update_attributes(featured: true)
        expect(old_answer.reload.featured?).to be_false
      end
    end
  end
end
