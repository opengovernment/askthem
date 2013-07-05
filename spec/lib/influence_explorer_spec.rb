# -*- coding: utf-8 -*-
require 'spec_helper'

describe InfluenceExplorer do
  let(:api) { InfluenceExplorer.new }
  let(:id) { 'fd638c2fb8b54d0bbc8b13ec32343930' }

  describe '#data_for' do
    it 'returns hash of data from Influence Explorer api', :vcr do
      data = api.data_for(id)
      expect(data['metadata']['bio']).to eq tim_ashe_bio
      expect(data['metadata']['bio_url']).to eq tim_ashe_wikipedia_url
    end
  end

  def tim_ashe_bio
    "<p>Timothy Ashe (born December 10, 1976) is one of six current Vermont Senators from the Chittenden Vermont Senate District.</p><p>Ashe graduated from the University of Vermont in 1999. He immediately went to work in then Congressman Bernie Sanders’ Burlington office where he worked for two and a half years. In late 2001 Ashe took a position with United Academics, the faculty union at the University of Vermont.</p><p>From 2002 to 2004 Ashe attended Harvard’s Kennedy School of Government. While there he concentrated his studies on domestic social policy. He also served as a teaching assistant to Ed Miliband, now a British MP and the leader of the Labour Party, in a course comparing US and northern European social policy. Upon graduating Ashe moved back home to Vermont.</p>"
  end

  def tim_ashe_wikipedia_url
    "http://en.wikipedia.org/wiki/Tim_Ashe"
  end
end
