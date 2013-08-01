jQuery ($) ->
  if $('#recipient-step').is(':visible')
    $('#recipient-step input[type=text]:eq(0)').focus()

  $('textarea').css('overflow', 'hidden').autogrow()

  $('#question_title').keyup ->
    $('.summary_count').text($(this).attr('maxlength') - $('#question_title').val().length)

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
        # TODO: this should add radio button for matching person
        # as question[person_id] input, see getPeople
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
    personError 'remove'

    if $(this).hasClass('twitter') and !$(this).hasClass('active')
      $('div.address_lookup').hide()
      $('div.twitter').show()
      $('div.twitter input[type=text]:eq(0)').focus()
    else
      if $(this).hasClass('address_lookup') and !$(this).hasClass('active')
        $('div.twitter').hide()
        $('div.address_lookup').show()
        $('div.address_lookup input[type=text]:eq(0)').focus()
        reloadValidationForForm()


    if !$(this).hasClass('active')
      $('span.toggle a.active').removeClass('active')
      $(this).addClass('active')

  $("#question_user_attributes_postal_code").keyup (e) ->
    theInput = e.delegateTarget
    showPeopleForAddress theInput

  showPeopleForAddress = (theInput) ->
    unless $('div.address_lookup').length == 0
      zipLength = $(theInput).val().length
      if zipLength is 5 or zipLength > 5
        $('.loading').hide()

        # redundant, but covers case where zip is pasted in
        if $('label.select-person').is(':hidden')
          $('label.select-person').fadeTo(300, 1)

        if $('ul.people-type').is(':hidden')
          $('ul.people-type').fadeTo(300, 1)

        getPeople()
      else
        # show recipient header and loading
        if $('label.select-person').is(':hidden')
          $('label.select-person').fadeTo(300, 1)
          $('.loading').fadeTo(300, 1)

  updateSelectedPerson = (e) ->
    personLi = e.delegateTarget

    name = $(personLi).children('h2').text()
    avatarHtml = $(personLi).children('.avatar').html()
    jurisdiction = $(personLi).children('.person-info').children('.jurisdiction').text()

    $('.select_box').children('input').attr 'checked', false
    $('.icon-ok-sign').hide()

    selectedPersonInput = $(personLi).children('.select_box').children('input')
    selectedPersonInput.attr 'checked', true
    # $('#question_person_id').val selectedPersonInput.val()
    personError 'remove'

    $(personLi).children('.icon-ok-sign').show()

    # TODO: make link for person
    $('#confirm-person-name').html "<strong>#{name}</strong>"
    $('#content-person-name').html name
    $('#confirm-person-attributes').html "<strong>#{jurisdiction}</strong>"

  getPeople = (type = 'Person') ->
    address = $('#question_user_attributes_street_address').val()
    address += ' ' + $('#question_user_attributes_locality').val()
    address += ' ' + $('#question_user_attributes_region').val()
    address += ' ' + $('#question_user_attributes_postal_code').val()

    url = "/locator.json?q=#{encodeURIComponent(address)}"
    url += "&type=FederalLegislator" if type == 'FederalLegislator'

    $.ajax
      url: url
      type: 'GET'
      dataType: 'json'
      success: (data) ->
        personList = $('div.address_lookup ol.people-list').first()
        personList.html('')
        $('#question_person_id').remove() # our radio buttons replace this below
        $(data).each ->
          liVal = '<li style="display:none;">'
          liVal += '<div class="select_box">'
          liVal += "<input type=\"radio\" name=\"question[person_id]\" id=\"question_person_id_#{@id}\" value=\"#{@id}\" /></div>"

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

  switchToPeopleType = (type = 'Person') ->
    id = '#state-people'
    oldId = '#federal-people'
    if type == 'FederalLegislator'
      id = '#federal-people'
      oldId = '#state-people'

    $(id).addClass 'active'
    $(oldId).removeClass 'active'

    getPeople(type)

  $('#federal-people a').click (event) ->
    switchToPeopleType('FederalLegislator')

  $('#state-people a').click (event) ->
    switchToPeopleType()

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

    valid = true
    $('[data-validate]:input:visible').each ->
      settings = window.ClientSideValidations.forms['new_question']
      valid = false if !$(this).isValid(settings.validators)

    if currentStep == 'recipient' and
      $('input[name="question[person_id]"]:checked').length is 0
        personError()
        valid = false

    # do the rest of next step processing
    if valid
      scrollOffset = $('section.question').offset().top - 60
      $(window).stop().scrollTo(scrollOffset, 500)

      $(currentStepId).fadeTo 100, 0, ->
        $(currentStepId).hide()
        $(nextStepId).fadeTo 200, 1
        reloadValidationForForm()

      $(nextStepId + ' input[type=text]:eq(0)').focus()

      $(button).attr 'data-current-step', nextStepName
      $('.step-number').text nextStepNumber

      # last step, hide progress area
      if nextStepNumber is steps.length
        $(button).hide()
        $('.count').hide()
      else
        $(button).show()
        $('.count').show()
    valid

  $('#next-button').click (event) ->
    nextStep event

  beginAgain = (event) ->
    nextButton = $('#next-button')
    steps = $(nextButton).attr('data-relevant-steps').split(', ')

    firstStep = steps[0]
    lastStep = steps[steps.length - 1]

    $(nextButton).attr 'data-current-step', firstStep

    $(stepId(lastStep)).hide()
    $(stepId(firstStep)).fadeTo 200, 1

    $('.step-number').text 1
    $(nextButton).show() if $(nextButton).is(':hidden')
    $('.count').show() if $('.count').is(':hidden')

  $('#edit-button').click (event) ->
    beginAgain event

  $('#question_title').keyup (event) ->
    value = $('#question_title').val()
    $('#confirm-question-title').text value

  $('#question_body').keyup (event) ->
    value = $('#question_body').val()
    $('#confirm-question-body').text value

  $('#question_user_attributes_given_name').keyup (event) ->
    $('.author .firstname').text $('#question_user_attributes_given_name').val()

  $('#question_user_attributes_family_name').keyup (event) ->
    $('.author .lastname').text $('#question_user_attributes_family_name').val()

  $('#question_subject').change (event) ->
    value = $('#question_subject').val()
    $('#question-subject').text value
    $('#confirm-issue-value').text value
    if value? and value isnt ''
      $('#confirm-issue').show()
    else
      $('#confirm-issue').hide()

  # since we have a multi-step form
  # each time we change the visibility of inputs
  # we have to re-enable client side validations
  reloadValidationForForm  = (->
    $('#new_question').enableClientSideValidations()
  )

  # because we are working with hidden radio buttons
  # ClientSideValidations directly won't work for us
  # this gives us the message we expect where we want it
  # while using the same format as ClientSideValidations
  personError = (action = 'add') ->
    formSettings = ClientSideValidations.forms['new_question']
    inputTag = $(formSettings.input_tag)
    selectPersonList = $('ol.people-list:visible')
    if action is 'add'
      message = 'Recipient ' +
        formSettings.validators['question[person_id]'].presence[0].message

      selectPersonList.before inputTag
      inputTag.find('span#input_tag').replaceWith selectPersonList
      inputTag.find('label.message').text message
      inputTag.find('label.message').attr('for', 'question_person_id')
    else
      fieldErrorClass = '.' + $(inputTag).attr('class')
      fieldErrorWrapper = selectPersonList.closest(fieldErrorClass)
      if fieldErrorWrapper[0]
        fieldErrorWrapper.replaceWith selectPersonList

  hideLaterSteps()
