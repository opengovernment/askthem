# -*- coding: utf-8 -*-
# class methods for legislator subclasses of Person
module LegislatorFinder
  def for_location(location, api = nil)
    api ||= default_api.new
    where(:id.in => api.ids_for(LocationFormatter.new(location).format))
  end
end
