# -*- coding: utf-8 -*-
# mixin for legislator functionality
module Legislator
  def most_recent_chamber
    most_recent :chamber
  end

  def most_recent_chamber_title
    metadatum.chamber_title most_recent_chamber
  end

  def most_recent_district
    most_recent :district
  end
end
