jQuery ($) ->
  $("form#new_registration input#user_email").keyup (e) ->
    emailAddress = $(e.delegateTarget).val()

    # only fire once the email is valid address
    pattern = /^[^@]+@[^\.]+\..+$/
    matchingPerson = $('.matching-person')
    if pattern.test(emailAddress) and matchingPerson.length == 0
      getMatchingPerson emailAddress

  getMatchingPerson = (emailAddress) ->
    url = "/identifier.json?email=#{encodeURIComponent(emailAddress)}"

    $.ajax
      url: url
      type: 'GET'
      dataType: 'json'
      success: (data) ->
        # break after first result, as we only want first match
        breakerbreaker = false
        $(data).each ->
          unless breakerbreaker
            divVal = '<div class="matching-person" style="display:none;">'
            divVal += "<label for=\"user[person_id]\">Are you #{@full_name}?</label>"
            divVal += "<input type=\"checkbox\" name=\"user[person_id]\" id=\"user_person_id_#{@id}\" value=\"#{@id}\" />"

            divVal += '<div class="avatar">'
            if @photo_url?
              divVal += "<img src=\"http://d2xfsikitl0nz3.cloudfront.net/#{encodeURIComponent(@photo_url)}/60/60\" width=\"60\" height=\"60\" alt=\"\" />"
            else
              divVal += "<img src=\"http://lorempixel.com/60/60/\" width=\"60\" height=\"60\" alt=\"\" />"
            divVal += '</div>'

            divVal += '<div class="person-info">'
            divVal += '<span class="jurisdiction">'
            personAttributes = []
            personAttributes.push @political_position_title if @political_position_title?
            personAttributes.push @most_recent_district if @most_recent_district?
            personAttributes.push @party if @party?
            divVal += personAttributes.join(', ')
            divVal += '</span></div>'
            divVal += "</div>"

            wrapper = $('div.input.user_email').first()
            wrapper.append divVal

            wrapper.children('div.matching-person').fadeTo(300, 1)
          breakerbreakter = true
