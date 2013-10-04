jQuery ($) ->
  
  filterContent = (e) ->
    radioName = e.delegateTarget
    if $(radioName).hasClass 'inactive'
      $(radioName).addClass('active').removeClass('inactive')
      $(radioName).siblings('a.radio_button').removeClass('active').addClass('inactive')
      $(radioName).on "ajax:before", (e) ->
        e.currentTarget.search = e.currentTarget.search.replace('false', 'true')
    else
      $(radioName).removeClass('active').addClass('inactive')
      $(radioName).on "ajax:before", (e) ->
        e.currentTarget.search = e.currentTarget.search.replace('true', 'false')
  
  if $('div.filters').length
    $('a.radio_button.filter').on "ajax:complete", (e, data, status, xhr) ->
      $('#page').replaceWith data.responseText
    $('a.radio_button.filter').click (e) ->
      e.preventDefault()
      filterContent(e)
