# -*- coding: utf-8 -*-
require 'influence_explorer'

class InfluenceExplorerPersonDetail
  include ActionView::Helpers::SanitizeHelper

  attr_accessor :person, :person_detail

  # @params [Hash] options optional arguments
  # @option options [String] :api_key a Influence Explorer API key
  def initialize(person, options = {})
    @person = person
    @person_detail = options[:person_detail] || person.person_detail
  end

  def person_detail
    # skip, at least for now, if we have existing bio
    if person.read_attribute(:transparencydata_id).blank? ||
        @person_detail.biography.present? ||
        @person_detail.links.any?
      return @person_detail
    end

    update_person_detail
    @person_detail
  end

  private
  def biography_and_link_from(data)
    if data['metadata']['bio']
      @person_detail.biography = strip_tags(data['metadata']['bio']).strip
    end
    if data['metadata']['bio_url']
      link = @person_detail.links.find_or_initialize_by(note: 'Wikipedia')
      link.url = data['metadata']['bio_url']
    end
  end

  def update_person_detail
    data = InfluenceExplorer.new().data_for(person.transparencydata_id)
    biography_and_link_from data
  end
end
