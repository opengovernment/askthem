require "spec_helper"

describe RegisteredRedirect do
  describe ".match" do

    context "given a request with no registered from_url_pattern" do
      let(:request) { double(fullpath: "xyz") }

      it "returns nothing" do
        expect(RegisteredRedirect.match(request).count).to eq 0
      end
    end

    context "given a request with a registered from_url_pattern" do
      let(:url) { "/people/1" }
      let(:request) { double(fullpath: url) }

      it "returns corresponding registered_redirect" do
        RegisteredRedirect.create!(from_url_pattern: url,
                                   to_url_pattern: "something else")

        expect(RegisteredRedirect.match(request).count).to eq 1
      end
    end
  end

  describe "#new_url_from" do
    context "when from_url_pattern is complete file path" do
      let(:old_url) { "/old/1" }
      let(:new_url) { "/new/1" }
      let(:request) { double(fullpath: old_url) }

      it "returns exact replacement url" do
        registered_redirect = RegisteredRedirect.new(from_url_pattern: old_url,
                                                     to_url_pattern: new_url)

        expect(registered_redirect.new_url_from(request)).to eq new_url
      end
    end
  end
end
