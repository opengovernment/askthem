jQuery ($) ->
  isHeadless = ->
    navigator.userAgent.indexOf('PhantomJS') > -1

  if $('#recipient-step').is(':visible')
    $('#recipient-step input[type=text]:eq(0)').focus()

  $('textarea').css('overflow', 'hidden').autogrow()

  $('#question_title').on 'input', (event) ->
    $target = $ event.target
    $target.parent().find('.summary_count').text($(this).attr('maxlength') - $target.val().length)

  popup = (event, height) ->
    event.preventDefault()
    window.open $(this).attr('href'), null,
      'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=' + height + ',left=' + Math.round((screen.width - 550) / 2) + ',top=' + Math.max(0, Math.round((screen.height - height) / 2))

  $('.actions .icon-facebook').click (event) ->
    popup.call(this, event, 270) # auto-resizes

  $('.actions .icon-twitter').click (event) ->
    popup.call(this, event, 270)

  $('.actions .icon-google-plus').click (event) ->
    popup.call(this, event, 227) # auto-resizes

  $('time[data-time-ago]').timeago()

  getTwitter = (elem) ->
    loading = $('.loading')
    loading.show()

    screenName = $(elem).val().replace('@', '')
    url = "/identifier.json?twitter_id=#{encodeURIComponent(screenName)}"

    $.ajax
      url: url
      type: "GET"
      dataType: "json"
      success: (data) ->
        refreshPersonList(data, 'reload', 'div.twitter')

  $("#twitter").on 'input',  (->
    nameLength = $(this).val().length
    if nameLength > 1
      getTwitter($(this))
    else
      if nameLength == 0
        clearPersonList 'div.twitter'
  )

  $('span.toggle a.select').click (event) ->
    personError 'remove'
    $('.loading').hide()

    if $(this).hasClass('twitter') and !$(this).hasClass('active')
      $('div.address_lookup').hide()
      $('div.name-lookup').hide()
      $('div.twitter').show()
      $('div.twitter input[type=text]:eq(0)').focus()
    else
      if $(this).hasClass('address_lookup') and !$(this).hasClass('active')
        $('div.twitter').hide()
        $('div.name-lookup').hide()
        $('div.address_lookup').show()
        $('div.address_lookup input[type=text]:eq(0)').focus()
        reloadValidationForForm()
        # this will only show people if zip is complete
        showPeopleForAddress($("#question_user_attributes_postal_code"))
      else
        if $(this).hasClass('name-lookup') and !$(this).hasClass('active')
          $('div.twitter').hide()
          $('div.address_lookup').hide()
          $('div.name-lookup').show()
          $('div.name-lookup input[type=text]:eq(0)').focus()

    if !$(this).hasClass('active')
      $('span.toggle a.active').removeClass('active')
      $(this).addClass('active')

  $('#name-lookup').on 'input', (e) ->
    theInput = $('#name-lookup')

    if $(theInput).val().length > 0
      jurisdiction = $(location).attr('pathname').split('/')[1]
      showPeopleForName theInput, jurisdiction
    else
      clearPersonList 'div.name-lookup'

  showPeopleForName = (theInput, jurisdiction) ->
    value = $.trim(theInput.val())
    unless value.length == 0
      getPeopleFromText(value, jurisdiction)

  getPeopleFromText = (text, jurisdiction) ->
    loading = $('.loading')
    loading.show()

    url = "/identifier.json?name_fragment=#{encodeURIComponent(text)}&jurisdiction=#{jurisdiction}"

    $.ajax
      url: url
      type: 'GET'
      dataType: 'json'
      success: (data) ->
        refreshPersonList(data, 'reload', 'div.name-lookup')

  reloadAsNewQuestionForPerson = (e) ->
    personLi = e.delegateTarget

    selectedPersonInput = $(personLi).children('.select_box').children('input')
    value = selectedPersonInput.val()
    url = $(location).attr('href')

    if url.indexOf('?') > -1
      url += "&"
    else
      url += "?"
    url = "#{url}person=#{value}"

    window.location.href = url

  $("#question_user_attributes_postal_code").on 'input', (e) ->
    theInput = e.delegateTarget
    if $(theInput).val().length > 0
      showPeopleForAddress theInput
    else
      clearPersonList

  showPeopleForAddress = (theInput) ->
    unless $('div.address_lookup').length == 0
      zipLength = $(theInput).val().length
      if zipLength is 5
        # redundant, but covers case where zip is pasted in
        if $('label.select-person').is(':hidden')
          $('label.select-person').fadeTo(300, 1)
          $('div.address_lookup .loading').fadeTo(300, 1)

        getPeople()
      else
        if zipLength > 0 and $('label.select-person').is(':hidden')
          $('label.select-person').fadeTo(300, 1)
          $('div.address_lookup .loading').fadeTo(300, 1)

  updateSelectedPerson = (e) ->
    personLi = e.delegateTarget

    name = $(personLi).children('h2').text()
    avatarHtml = $(personLi).children('.avatar').html()
    jurisdiction = $(personLi).children('.person-info').children('.jurisdiction').text()

    avatarHtmlSmall = avatarHtml.replace('60/60', '30/30')
      .replace('height="60"', 'height="30"')
      .replace('width="60"', 'width="30"')
      .replace('>', 'class="official-image avatar-image" >')

    $('.select_box').children('input').attr 'checked', false
    $('.icon-ok-sign').hide()

    selectedPersonInput = $(personLi).children('.select_box').children('input')
    selectedPersonInput.attr 'checked', true
    personError 'remove'

    $(personLi).children('.icon-ok-sign').show()

    # TODO: make link for person
    $('#confirm-person-name').html "<strong>#{name}</strong>"
    $('#confirm-person-image').html avatarHtmlSmall
    $('#content-person-image').html avatarHtmlSmall
    $('#content-person-name').html name
    if jurisdiction? and jurisdiction isnt ''
      $('#content-person-short-description').html '(' + jurisdiction + ')'
    $('#confirm-person-attributes').html "<strong>#{jurisdiction}</strong>"
    $.scrollTo('#next-button', 500)

  getPeople = () ->
    address = $('#question_user_attributes_street_address').val()
    address += ' ' + $('#question_user_attributes_locality').val()
    address += ' ' + $('#question_user_attributes_region').val()
    address += ' ' + $('#question_user_attributes_postal_code').val()

    url = "/locator.json?q=#{encodeURIComponent(address)}"

    $.ajax
      url: url
      type: 'GET'
      dataType: 'json'
      success: (data) ->
        refreshPersonList(data, "update")

  clearPersonList = (lookupDiv = 'div.address_lookup') ->
    personList = $("#{lookupDiv} ol.people-list").first()
    personList.html('')

  refreshPersonList = (data, updateOrReload, lookupDiv = 'div.address_lookup') ->
    loading = $('.loading')
    loading.show()

    personList = $("#{lookupDiv} ol.people-list").first()
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
        placeholderUrl = "http://" + $(location).attr('host') + "/assets/placeholder.png"
        liVal += "<img src=\"http://d2xfsikitl0nz3.cloudfront.net/#{encodeURIComponent(placeholderUrl)}/60/60\" width=\"60\" height=\"60\" alt=\"\" />"
      liVal += '</div>'

      liVal += "<h2>#{@full_name}</h2>"

      liVal += '<div class="person-info">'
      liVal += '<span class="jurisdiction">'
      personAttributes = []
      personAttributes.push @political_position_title if @political_position_title?
      personAttributes.push @most_recent_district if @most_recent_district?
      personAttributes.push @party if @party?
      liVal += personAttributes.join(', ')
      liVal += '</span></div>'
      liVal += '<span class="selected icon-ok-sign"></span>'

      liVal += "</li>"

      personList.append liVal

      personList.children('li:last').fadeTo(300, 1)
    loading.hide()
    personList.show()
    personList.children('li').on 'click', (e) ->
      if updateOrReload == 'update'
        updateSelectedPerson e
      else
        reloadAsNewQuestionForPerson e

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

  $('#question_title').on 'input', (event) ->
    value = $('#question_title').val()
    $('#confirm-question-title').text value

  $('#question_body').on 'input', (event) ->
    value = $('#question_body').val()
    $('#confirm-question-body').text value

  $('#question_user_attributes_given_name').on 'input', (event) ->
    $('.author .firstname').text $('#question_user_attributes_given_name').val()

  $('#question_user_attributes_family_name').on 'input', (event) ->
    $('.author .lastname').text $('#question_user_attributes_family_name').val()

  $('#question_subject').change (event) ->
    value = $('#question_subject').val()
    $('#question-subject').text value
    $('#confirm-issue-value').text value
    if value? and value isnt ''
      $('#confirm-issue').show()
    else
      $('#confirm-issue').hide()

  $('#question_user_attributes_street_address').blur (event) ->
    manualValidate($('#question_user_attributes_street_address'), 'question[user_attributes][street_address]', 'question_user_attributes_street_address')

  $('#question_user_attributes_locality').blur (event) ->
    manualValidate($('#question_user_attributes_locality'), 'question[user_attributes][locality]', 'question_user_attributes_locality')

  manualValidate = (field, fieldName, forId) ->
    value = field.val()
    formSettings = window.ClientSideValidations.forms['new_question']
    inputTag = $(formSettings.input_tag)
    originalParent = field.parent().parent()

    if value? and value isnt ''
      fieldErrorClassName = $(inputTag).attr('class')
      fieldErrorClass = ".#{fieldErrorClassName}"
      fieldErrorWrapper = field.closest(fieldErrorClass)
      fieldErrorLabelWrapper = originalParent.children("div.#{fieldErrorClassName}")
      if fieldErrorWrapper[0]
        fieldErrorWrapper.replaceWith field
      if fieldErrorLabelWrapper[0]
        plainLabel = fieldErrorLabelWrapper.children('label').not('.message')
        if plainLabel[0]
          fieldErrorLabelWrapper.replaceWith plainLabel

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
      inputTag.find('label.message').html message
      inputTag.find('label.message').attr('for', 'question_person_id')
    else
      fieldErrorClass = '.' + $(inputTag).attr('class')
      fieldErrorWrapper = selectPersonList.closest(fieldErrorClass)
      if fieldErrorWrapper[0]
        fieldErrorWrapper.replaceWith selectPersonList

  hideLaterSteps()

  # handle case that at page load, postal code is already set for signed in user
  showPeopleForAddress($("#question_user_attributes_postal_code"))
