Popolo::Area.class_eval do
  def display_name
    Chronic::Numerizer.numerize(name)
  end
end
