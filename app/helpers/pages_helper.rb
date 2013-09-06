module PagesHelper
  def csv_safe_links_for(person)
    links = person.person_detail.links.inject([]) do |results, link|
      results << "#{link.note}: #{link.url}"
    end
    links.any? ? links.join(' ; ') : nil
  end

  def csv_safe_office_details_for(person)
    offices = person.read_attribute(:offices)
    if offices.any?
      offices.to_s.gsub('"', "").gsub("=>", ":").gsub("[", "").gsub("\\n", " ")
        .gsub("]", "").gsub("},", " - ").gsub("{", "").gsub(",", "")
        .gsub("nil", "").gsub("}", "")
    end
  end
end
