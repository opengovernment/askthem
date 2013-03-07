jQuery ($) ->
  if $('a.expand_menu').is(':visible')
    $('a.expand_menu').click ->
      $this = $(this)
      
      if $this.hasClass('expanded')
        $this.removeClass('expanded')
        $this.html('<span class="icon-angle-down"></span> Expand Menu')
        $('ul.top_nav li').not('.subject').hide()
      else
        $this.addClass('expanded')
        $this.html('<span class="icon-angle-up"></span> Collapse Menu')
        $('ul.top_nav li').not('.subject').show()