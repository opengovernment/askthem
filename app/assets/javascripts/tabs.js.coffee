jQuery ($) ->
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
      $('html,body').animate({scrollTop: $(scroll).offset().top}, 'slow')
      replace(target, data)
      $('#' + state.id).addClass('active') if state.id

  $('#questions-near').click (e) ->
    locatorGoTo 'section.questions', e.delegateTarget

  $('#officials-near').click (e) ->
    locatorGoTo 'section.officials', e.delegateTarget

  locatorGoTo = (target, e) ->
    $('section.locator').fadeOut 'fast'
    $(target).fadeIn 'slow'

    # remove "active" class from all links inside #nav
    $('nav.questions-or-officials li').removeClass('active')

    # add active class to the current link
    $(e).parent().addClass('active')

  $('#federal-people').click (e) ->
    locatorPeopleGoTo '.federal-people-list', e.delegateTarget

  $('#state-people').click (e) ->
    locatorPeopleGoTo '.state-people-list', e.delegateTarget

  locatorPeopleGoTo = (target, e) ->
    $('.people-list').fadeOut 'fast'
    $(target).fadeIn 'slow'
