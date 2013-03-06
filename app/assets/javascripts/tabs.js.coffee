jQuery ($) ->
  $('.related_nav a').click (e) ->
    e.preventDefault()
    $this = $(this)
    # Without the .js extension, Rails uses the HTML not the JS responder.
    $.ajax($this.attr('href') + '.js', dataType: 'html').done (data) ->
      $('.related_nav .active').removeClass('active')
      $('.related_focus').replaceWith(data)
      $this.addClass('active')
