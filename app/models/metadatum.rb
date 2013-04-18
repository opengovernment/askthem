# Billy
class Metadatum
  include Mongoid::Document

  # Returns the brief name of the chamber.
  #
  # @param [String] chamber "lower" or "upper"
  # @return [String] the brief name of the chamber
  def chamber_name(chamber)
    read_attribute(:chambers)[chamber].try{|chamber| chamber['name']} || chamber
  end

  # Returns the title for members of the chamber.
  #
  # @param [String] chamber "lower" or "upper"
  # @return [String] the title for members of the chamber
  def chamber_title(chamber)
    read_attribute(:chambers)[chamber].try{|chamber| chamber['title']}
  end
end
