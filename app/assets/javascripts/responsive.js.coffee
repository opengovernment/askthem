jQuery ($) ->
  $('.mobile_admin_nav a.expose_nav').click ->
    $this = $(this)
    if $this.hasClass('expanded')
      $this.removeClass('expanded')
      $this.siblings('.admin_nav').hide()
    else
      $this.addClass('expanded')
      $this.siblings('.admin_nav').show()
    