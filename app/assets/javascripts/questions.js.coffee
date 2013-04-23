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
