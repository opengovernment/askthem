module SignaturesHelper
  def signers_description(signer)
    description = "#{signer.given_name} #{signer.family_name}"

    if signer.image?
      avatar_tag = image_tag(signer.image.url,
                             size: "40x40",
                             alt: "",
                             class: "avatar-image")

      description = "#{avatar_tag} #{description}"
    end

    if signer.locality.present? && signer.region.present?
      description = "#{description} (#{signer.locality}, #{signer.region.upcase})"
    end

    description.html_safe
  end
end
