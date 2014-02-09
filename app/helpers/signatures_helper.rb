module SignaturesHelper
  def signers_description(signer)
    description = sanitize("#{signer.given_name} #{signer.family_name}")

    avatar_tag = if signer.image?
                   cdn_image_tag(signer.image.url,
                                 size: "40x40",
                                 alt: "",
                                 class: "avatar-image")
                 else
                   image_tag("placeholder.png",
                             size: "40x40",
                             class: "avatar-image")
                 end

    description = "#{avatar_tag} #{description}"

    if signer.locality.present? && signer.region.present?
      signer_from = sanitize("(#{signer.locality}, #{signer.region.upcase})")
      description = "#{description} #{signer_from}"
    end

    description.html_safe
  end
end
