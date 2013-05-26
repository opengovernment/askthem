jQuery ($) ->
  
  filterContent = (e) ->
    radioName = e.delegateTarget
    console.log radioName
  
  if $('div.filters').length
    console.log 'test'
    $('a.radio_button.filter').click (e) ->
      filterContent(e)