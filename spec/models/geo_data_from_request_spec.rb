require "spec_helper"

# set up and clear redis database
describe GeoDataFromRequest do
  let(:ny_ip) { "72.43.115.186" }
  let(:fake_location) { "Fake New York, NY" }

  describe "#geo_data" do
    context "given a request object from within the US" do
      it "returns geo data result" do
        request = double
        request.stub(location: fake_location)
        request.stub(remote_addr: ny_ip)

        expect(GeoDataFromRequest.new(request).geo_data).to eq fake_location
      end

      context "when a request's IP has previously been used" do
        before do
          redis = Redis.new
          previous_geo_data = redis.get(ny_ip)
          set_ip_in(redis) unless previous_geo_data.present?
        end

        it "returns geo data result from cache rather than new lookup" do
          request = double
          request.stub(remote_addr: ny_ip)
          expect(GeoDataFromRequest.new(request).geo_data).to eq fake_location
        end

        def set_ip_in(redis)
          redis.set(ny_ip, Marshal.dump(fake_location))
        end
      end
    end
  end
end
