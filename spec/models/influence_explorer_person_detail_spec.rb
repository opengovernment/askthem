# -*- coding: utf-8 -*-
require 'spec_helper'

describe InfluenceExplorerPersonDetail do
  before :each do
    @metadatum = Metadatum.with(session: 'openstates').create(abbreviation: 'vt')

    # convoluted setting of id necessary, otherwise id gets generated
    person_params = { state: 'vt',
      transparencydata_id: 'fd638c2fb8b54d0bbc8b13ec32343930' }

    @person = Person.with(session: 'openstates').new(person_params)
    @person.id = 'VTL000008'
    @person.save!
  end

  describe '#person_detail' do
    context 'when person has a biography already' do
      before :each do
        @person_detail = @person.person_detail
        @person_detail.biography = 'x'
        @person_detail.save!
      end

      it 'returns existing person_detail' do
        person_detail = InfluenceExplorerPersonDetail.new(@person).person_detail
        expect(person_detail).to eq @person_detail
      end
    end

    context 'when person does not have a biography' do
      it 'returns updated person_detail', :vcr do
        person_detail = InfluenceExplorerPersonDetail.new(@person).person_detail
        expect(person_detail.biography).to eq tim_ashe_bio_sanitized
        expect(person_detail.links.first.url).to eq tim_ashe_wikipedia_url
      end
    end

    # @todo DRY up with spec/lib/influence_explorer_spec.rb
    def tim_ashe_bio_sanitized
      "Timothy Ashe (born December 10, 1976) is one of six current Vermont Senators from the Chittenden Vermont Senate District.Ashe graduated from the University of Vermont in 1999. He immediately went to work in then Congressman Bernie Sanders’ Burlington office where he worked for two and a half years. In late 2001 Ashe took a position with United Academics, the faculty union at the University of Vermont.From 2002 to 2004 Ashe attended Harvard’s Kennedy School of Government. While there he concentrated his studies on domestic social policy. He also served as a teaching assistant to Ed Miliband, now a British MP and the leader of the Labour Party, in a course comparing US and northern European social policy. Upon graduating Ashe moved back home to Vermont."
    end

    def tim_ashe_wikipedia_url
      "http://en.wikipedia.org/wiki/Tim_Ashe"
    end
  end
end
