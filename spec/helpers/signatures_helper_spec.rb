require "spec_helper"

describe SignaturesHelper do
  describe "#signers_description" do
    context "when there is locality and region" do
      it "returns signer's name and where they are from" do
        signer = FactoryGirl.create(:user)
        with_where = "#{signer.given_name} #{signer.family_name}"
        with_where += " (#{signer.locality}, #{signer.region.upcase})"

        expect(helper.signers_description(signer)).to eq with_where
      end
    end

    context "when there is only a zipcode" do
      it "returns signer's name only" do
        signer = FactoryGirl.create(:user, locality: "", region: "")
        without_where = "#{signer.given_name} #{signer.family_name}"

        expect(helper.signers_description(signer)).to eq without_where
      end
    end

    context "when there is an avatar" do
      it "includes avatar of user" do
        signer = FactoryGirl.create(:user)

        # double image as we only need it for tag output
        image = double(url: "xyz")
        signer.stub(image: image, "image?".to_sym => true)

        expect(helper.signers_description(signer).include?(signer.image.url))
          .to be_true
      end
    end
  end
end
