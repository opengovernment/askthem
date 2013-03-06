jQuery ($) ->
  $('a.show_full_title').click (e) ->
    e.preventDefault()
    target = $(this).attr('target')
    $(".#{target}_short").hide()
    $(".#{target}_long").show()
  
  $('a.show_short_title').click (e) ->
    e.preventDefault()
    target = $(this).attr('target')
    $(".#{target}_short").show()
    $(".#{target}_long").hide()
