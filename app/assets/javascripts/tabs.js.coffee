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
    href = $(this).attr('href')
    History.pushState({href: href, id: $(this).attr('id')}, '', href)

  # Pagination on "Sponsored Bills" tab.
  $(document).on 'click', 'nav[data-replace] a', (e) ->
    e.preventDefault()
    href = $(this).attr('href')
    History.pushState({href: href}, '', href)

  # @todo Pagination on bills#index and subjects#show

  # "View all" link in sidebar.
  $('a[rel="sponsors"]').click (e) ->
    e.preventDefault()
    $('#sponsors-tab').click()

  History.Adapter.bind window, 'statechange', ->
    state = History.getState().data
    # @todo change page title
    $.ajax(ajaxURL(state.href), dataType: 'html').done (data) ->
      $related_nav = $('.related_nav')
      if $related_nav.length
        $('.related_nav .active').removeClass('active') if state.id

      $nav = $('nav[data-replace]')

      if $nav.length
        target = $nav.data('replace')
        scroll = $nav.data('scroll') or target
        scroller.animate({scrollTop: $(scroll).offset().top}, 'slow');
        replace(target, data)
      else
        scroller.animate({scrollTop: $('.related_wrap').offset().top}, 'slow');
        replace('.related_focus', data)

      if $related_nav.length
        $('#' + state.id).addClass('active') if state.id
