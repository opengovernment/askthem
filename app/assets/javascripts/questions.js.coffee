jQuery ($) ->
  $('#summary').focus()
  $('textarea').css('overflow', 'hidden').autogrow()

  $('#summary').keyup ->
    $('.summary_count').text($(this).attr('maxlength') - $('#summary').val().length)

  popup = (event, height) ->
    event.preventDefault()
    window.open $(this).attr('href'), null,
      'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=' + height + ',left=' + Math.round((screen.width - 550) / 2) + ',top=' + Math.max(0, Math.round((screen.height - height) / 2))

  $('.icon-facebook').click (event) ->
    popup.call(this, event, 270) # auto-resizes

  $('.icon-twitter').click (event) ->
    popup.call(this, event, 270)

  $('.icon-google-plus').click (event) ->
    popup.call(this, event, 227) # auto-resizes

  $('time[data-time-ago]').timeago()

  # <%# @todo JM to connect this to accounts that may be officials on OG %>

  getTwitter = (elem) ->
    $.ajax
      url: "http://api.twitter.com/1/users/lookup.json?screen_name=" + $(elem).val().slice(1) + "&callback=?"
      type: "GET"
      dataType: "json"
      success: (data) ->
        $("div.twitter .select-person li h2").html data[0].name
        $("div.twitter div.avatar img").attr 'src', data[0].profile_image_url
        $("div.twitter .select-person div.person-info p").html data[0].description
        $("div.twitter .select-person li").fadeTo(300, 1)
        # TODO: change below to reset person_id to val of twitter selected person
        $('#question_person_id').val ''


  $("#twitter").keyup(->
    if $(this).val()[0] is "@"
      getTwitter($(this))
    else
      $(this).addClass 'invalid'
  )

  $('span.toggle a.select').click (event) ->

    if $(this).hasClass('twitter') and !$(this).hasClass('active')
      $('div.address_lookup').hide();
      $('div.twitter').show();
    else
      if $(this).hasClass('address_lookup') and !$(this).hasClass('active')
        $('div.twitter').hide();
        $('div.address_lookup').show();

    if !$(this).hasClass('active')
      $('span.toggle a.active').removeClass('active icon-ok')
      $(this).addClass('active icon-ok')

  $("#zipcode").blur(->
    getPeople()
  )

  updateSelectedPerson = (e) ->
    personLi = e.delegateTarget

    name = $(personLi).children('h2').text()
    avatarHtml = $(personLi).children('.avatar').html()
    jurisdiction = $(personLi).children('.person-info').children('.jurisdiction').text()

    $('.select_box').children('input').attr 'checked', false
    $('.icon-ok-sign').hide()

    selectedPersonInput = $(personLi).children('.select_box').children('input')
    selectedPersonInput.attr 'checked', true
    $('#question_person_id').val selectedPersonInput.val()

    $(personLi).children('.icon-ok-sign').show()

    # TODO: make link for person
    $('ul.recipient h2').text name
    $('#confirm-person-name').html "<strong>#{name}</strong>"
    progressAvatar = $('ul.recipient li div.avatar')
    $(progressAvatar).html avatarHtml
    $(progressAvatar).show()
    $('ul.recipient .person-info .jurisdiction').text jurisdiction
    $('#confirm-person-attributes').html "<strong>#{jurisdiction}</strong>"

  getPeople = (->
    address = $('#street').val()
    address += ' ' + $('#city').val()
    address += ' ' + $('#question_user_region').val()
    address += ' ' + $('#zipcode').val()

    $.ajax
      url: "/locator.json?q=#{encodeURIComponent(address)}"
      type: 'GET'
      dataType: 'json'
      success: (data) ->
        $('label.select-person').fadeTo(300, 1)
        personList = $('div.address_lookup ol.people-list').first()
        personList.html('')
        $(data).each ->
          liVal = '<li style="display:none;">'
          liVal += '<div class="select_box">'
          liVal += "<input type=\"radio\" name=\"person-select\" id=\"#{@id}\" value=\"#{@id}\" /></div>"

          liVal += '<div class="avatar">'
          if @photo_url?
            liVal += "<img src=\"http://d2xfsikitl0nz3.cloudfront.net/#{encodeURIComponent(@photo_url)}/60/60\" width=\"60\" height=\"60\" alt=\"\" />"
          else
            liVal += "<img src=\"http://lorempixel.com/60/60/\" width=\"60\" height=\"60\" alt=\"\" />"
          liVal += '</div>'

          liVal += "<h2>#{@full_name}</h2>"

          liVal += '<div class="person-info">'
          liVal += '<span class="jurisdiction">'
          personAttributes = []
          personAttributes.push @most_recent_chamber_title if @most_recent_chamber_title?
          personAttributes.push @most_recent_district if @most_recent_district?
          personAttributes.push @party if @party?
          liVal += personAttributes.join(', ')
          liVal += '</span></div>'
          liVal += '<span class="selected icon-ok-sign"></span>'

          liVal += "</li>"

          personList.append liVal

          personList.children('li:last').fadeTo(300, 1)
        personList.children('li').on 'click', (e) ->
          updateSelectedPerson e
    )

  hideLaterSteps = (->
    $('article.not-first-step').each ->
      $(@).hide()
  )

  stepId = (step) ->
    '#' + step.replace('_', '-') + '-step'

  nextStep = (event) ->
    button = event.delegateTarget

    steps = $(button).attr('data-relevant-steps').split(', ')
    currentStep = $(button).attr 'data-current-step'
    currentStepId = stepId(currentStep)
    currentStepIndex = steps.indexOf(currentStep)

    nextStepIndex = currentStepIndex + 1
    nextStepName = steps[nextStepIndex]
    nextStepId = stepId(nextStepName)
    nextStepNumber = nextStepIndex + 1

    $(currentStepId).hide()
    $(nextStepId).show()

    $(button).attr 'data-current-step', nextStepName
    $('.step-number').text nextStepNumber

    # last step, hide progress area
    if nextStepNumber is steps.length
      $('.progress').hide()
      $(button).hide()
      $('.count').hide()
    else
      $('.progress').show() if $('.progress').is(':hidden')
      $(button).show()
      $('.count').show()

  $('#next-button').click (event) ->
    nextStep event

  beginAgain = (event) ->
    nextButton = $('#next-button')
    steps = $(nextButton).attr('data-relevant-steps').split(', ')

    firstStep = steps[0]
    lastStep = steps[steps.length - 1]

    $(nextButton).attr 'data-current-step', firstStep

    $(stepId(lastStep)).hide()
    $(stepId(firstStep)).show()
    $('.step-number').text 1
    $('.progress').show() if $('.progress').is(':hidden')
    $(nextButton).show() if $(nextButton).is(':hidden')
    $('.count').show() if $('.count').is(':hidden')

  $('#edit-button').click (event) ->
    beginAgain event

  $('#summary').keyup (event) ->
    value = $('#summary').val()
    $('.question_preview h5').removeClass('empty')
    $('.question_preview h5').text value
    $('#confirm-question-title').text value

  $('#question_body').keyup (event) ->
    value = $('#question_body').val()
    $('.question_preview p').text value
    $('#confirm-question-body').text value

  $('#firstname').keyup (event) ->
    $('.author .firstname').text $('#firstname').val()

  $('#lastname').keyup (event) ->
    $('.author .lastname').text $('#lastname').val()

  $('#question_subject').change (event) ->
    value = $('#question_subject').val()
    $('#question-subject').text value
    $('#confirm-issue-value').text value
    if value? and value isnt ''
      $('#progress-issue').show()
      $('#confirm-issue').show()
    else
      $('#progress-issue').hide()
      $('#confirm-issue').hide()

  hideLaterSteps()
