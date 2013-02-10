module ApplicationHelper
  def sort_by_name(documents)
    documents.sort do |a,b|
      x = Chronic::Numerizer.numerize(a.name)
      y = Chronic::Numerizer.numerize(b.name)

      if x[/\A\d+(st|nd|rd|th)/] && y[/\A\d+(st|nd|rd|th)/] && x[/(?<=st|nd|rd|th) .+/] != y[/(?<=st|nd|rd|th) .+/]
        x[/(?<=st|nd|rd|th) .+/] <=> y[/(?<=st|nd|rd|th) .+/]
      # If the names start with different numbers, sort numerically.
      # @note In OpenStates, MD, MN and SD start with numbers.
      elsif x[/\A\d/] && y[/\A\d/] && x[/\A\d+/].to_i != y[/\A\d+/].to_i
        x[/\A\d+/].to_i <=> y[/\A\d+/].to_i
      # If otherwise identical names end with a number, sort by the number.
      # @note In OpenStates, NH and VT end with numbers.
      elsif x[/[0-9]\z/] && y[/[0-9]\z/] && x[/\A\D+/] == y[/\A\D+/]
        x = x[/[0-9-]+\z/].split('-').map(&:to_i)
        y = y[/[0-9-]+\z/].split('-').map(&:to_i)

        result = 0
        [x.size, y.size].min.times do |index|
          if x[index] < y[index]
            result = -1
            break
          elsif x[index] > y[index]
            result = 1
            break
          end
        end
        result
      # Otherwise, sort normally.
      else
        x <=> y
      end
    end
  end
end
# MA