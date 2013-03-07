jQuery ($) ->
  $('#summary').focus()
  $('textarea').css('overflow', 'hidden').autogrow()

  $('#summary').keyup ->
    $('.summary_count').text($(this).attr('maxlength') - $('#summary').val().length)
