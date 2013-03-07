jQuery ($) ->
  # @todo load correct tab on page load

  $('.related_nav a').click (e) ->
    e.preventDefault()
    $this = $(this)

    # Without the .js extension, Rails uses the HTML not the JS responder.
    $.ajax($this.attr('href') + '.js', dataType: 'html').done (data) ->
      $('.related_nav .active').removeClass('active')
      $('.related_focus').replaceWith(data) # @todo animate
      # @todo add hash so that it loads correct tab on page load
      $this.addClass('active')

  $('.related_focus nav a').click (e) -> # @todo live handler
    e.preventDefault()
    $this = $(this)

    href = $this.attr('href')
    if href.indexOf('.js') == -1
      href = href.replace(/#.*/, '')
      if href.indexOf('?') == -1
        href = href + '.js'
      else
        href = href.replace('?', '.js?')

    $.ajax(href, dataType: 'html').done (data) ->
      # @todo scroll to top
      $('.related_focus').replaceWith(data) # @todo animate

  $('a[rel="sponsors"]').click (e) ->
    e.preventDefault()
    # @todo scroll to #sponsors
    $('#sponsors-tab a').click()
