# -*- coding: utf-8 -*-
require 'spec_helper'

describe PersonDetailRetriever do
  before :each do
    @metadatum = Metadatum.create(abbreviation: 'vt')

    # convoluted setting of id necessary, otherwise id gets generated
    person_params = { state: 'vt',
      first_name: 'Tim',
      last_name: 'Ashe',
      district: 'Chittenden',
      transparencydata_id: 'fd638c2fb8b54d0bbc8b13ec32343930' }

    @person = Person.new(person_params)
    @person.id = 'VTL000001'
    @person.stub :chamber, 'upper'
    @person.save!
  end

  describe '#person_detail' do
    it 'updates person_detail with data from apis', :vcr do
      PersonDetailRetriever.new(@person).retrieve!
      expect(@person.person_detail.biography).to eq tim_ashe_bio_sanitized
      expect(@person.person_detail.links.first.url).to eq tim_ashe_wikipedia_url
      expect(@person.person_detail.votesmart_id).to eq '80645'
    end

    # @todo DRY up with spec/lib/influence_explorer_spec,
    # spec/models/influence_explorer_person_detail
    def tim_ashe_bio_sanitized
      "Timothy Ashe (born December 10, 1976) is one of six current Vermont Senators from the Chittenden Vermont Senate District.Ashe graduated from the University of Vermont in 1999. He immediately went to work in then Congressman Bernie Sanders’ Burlington office where he worked for two and a half years. In late 2001 Ashe took a position with United Academics, the faculty union at the University of Vermont.From 2002 to 2004 Ashe attended Harvard’s Kennedy School of Government. While there he concentrated his studies on domestic social policy. He also served as a teaching assistant to Ed Miliband, now a British MP and the leader of the Labour Party, in a course comparing US and northern European social policy. Upon graduating Ashe moved back home to Vermont."
    end

    def tim_ashe_wikipedia_url
      "http://en.wikipedia.org/wiki/Tim_Ashe"
    end
  end
end
