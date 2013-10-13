jQuery ($) ->
  
  filterContent = (e) ->
    radioName = e.delegateTarget
    if $(radioName).hasClass 'inactive'
      $(radioName).addClass('active').removeClass('inactive')
      $(radioName).siblings('a.radio_button').removeClass('active').addClass('inactive')
    else
      $(radioName).removeClass('active').addClass('inactive')
  
  if $('div.filters').length
    $('a.radio_button.filter').click (e) ->
      e.preventDefault()
      filterContent(e)
