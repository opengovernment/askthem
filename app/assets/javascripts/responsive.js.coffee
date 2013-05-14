jQuery ($) ->
  $('a.expand_menu').click ->
    $this = $(this)
    if $this.hasClass('expanded')
      $this.removeClass('expanded')
      $this.html('<span class="icon-angle-down"></span> Expand Menu')
      $('.top_nav li').not('.subject').hide()
    else
      $this.addClass('expanded')
      $this.html('<span class="icon-angle-up"></span> Collapse Menu')
      $('.top_nav li').not('.subject').show()
      
  $('.mobile_admin_nav a.expose_nav').click ->
    $this = $(this)
    if $this.hasClass('expanded')
      $this.removeClass('expanded')
      $this.siblings('.admin_nav').hide()
    else
      $this.addClass('expanded')
      $this.siblings('.admin_nav').show()
    