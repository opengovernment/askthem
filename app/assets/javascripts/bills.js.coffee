$(document).ready ->
  if $('a.show_full_title').length
    $('a.show_full_title').click (e) ->
      e.preventDefault()
      text_target = $(this).attr('target')
      $('.'+ text_target + '_short').hide()
      $('.'+ text_target + '_long').show()
    
    $('a.show_short_title').click (e) ->
      e.preventDefault()
      text_target = $(this).attr('target')
      $('.'+ text_target + '_short').show()
      $('.'+ text_target + '_long').hide()