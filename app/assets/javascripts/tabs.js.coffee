jQuery ($) ->
  # Finds the right HTML node to scroll.
  scroller = null
  $('html,body').each ->
    $this = $(this)
    if $this.scrollTop() > 0
      scroller = $this
    else
      $this.scrollTop(1)
      test = $this.scrollTop() > 0
      $this.scrollTop(0)
      scroller = $this if test

  # Replaces the selector's content with the HTML data over a fade transition.
  replace = (selector, data) ->
    $(selector).fadeOut 'fast', ->
      $(this).replaceWith(data)
      $(selector).fadeIn 'slow'

  # Adds a ".js" extension to a URL to ensure Rails uses the JS responder.
  ajaxURL = (url) ->
    if url.indexOf('.js') == -1
      url = url.replace(/#.*/, '')
      if url.indexOf('?') == -1
        url = url + '.js'
      else
        url = url.replace('?', '.js?')

  # Tabs on people#show and bills#show.
  $('.related_nav a').click (e) ->
    e.preventDefault()
    $this = $(this)
    href = $this.attr('href')
    History.pushState({href: href, id: $this.attr('id')}, $this.data('title'), href)

  # Pagination.
  $(document).on 'click', 'nav[data-replace] a', (e) ->
    e.preventDefault()
    $this = $(this)
    href = $this.attr('href')
    History.pushState({href: href}, $this.data('title'), href)

  # "View all" link in sidebar.
  $('a[rel="sponsors"]').click (e) ->
    e.preventDefault()
    $('#sponsors-tab').click()

  History.Adapter.bind window, 'statechange', ->
    state = History.getState().data
    $.ajax(ajaxURL(state.href), dataType: 'html').done (data) ->
      $nav = $('nav[data-replace]')
      if state.id
        target = '.related_focus'
        scroll = '.related_wrap'
      else
        target = $nav.data('replace')
        scroll = $nav.data('scroll') or target

      $('.related_nav .active').removeClass('active') if state.id
      scroller.animate({scrollTop: $(scroll).offset().top}, 'slow');
      replace(target, data)
      $('#' + state.id).addClass('active') if state.id
