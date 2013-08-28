module PagesHelper
  def csv_safe_links_for(person)
    links = person.person_detail.links.inject([]) do |results, link|
      results << "#{link.note}: #{link.url}"
    end
    links.any? ? links.join(' ; ') : nil
  end
end
