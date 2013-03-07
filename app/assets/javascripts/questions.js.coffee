jQuery ($) ->
  $('#summary').focus()
  $('textarea').css('overflow', 'hidden').autogrow()

  $('#summary').keyup ->
    max_length = $(this).attr('maxlength')
    
    $('span.summary_count').text ->
      return max_length - $('#summary').val().length