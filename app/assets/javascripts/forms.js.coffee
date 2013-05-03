togglePeopleSelect = (elem) ->
  if $(elem).children('div.select_box').children("input:radio").prop("checked") is false
    $(elem).siblings("li").removeClass("selected").addClass "deselected"
    $(elem).children('div.select_box').children("input:radio").prop "checked", true
    $(elem).addClass("selected").removeClass "deselected"

$ ->
  $(".people-list.select-person li").click ->
    togglePeopleSelect this
  
  if $('div.actions.scroll_this').length
    
    didScroll = false
    scrollElem = $('div.actions.scroll_this')
    scrollPoint = ''
    startTop = $(scrollElem).offset().top
    addedMargin = ''
    
    $(window).scroll ->
      didScroll = true

    #to avoid firing functions on every scroll event, we're setting an interval to check if we've scrolled.
    setInterval (->
      if didScroll && $(window).height() > $('div.actions.scroll_this').outerHeight()
        if $(window).scrollTop() + $(scrollElem).offset().top < $('.content_body').height()
          if scrollElem

            #catch the windows scrolled point
            scrollPoint = $(window).scrollTop()
      
            addedMargin = scrollPoint - startTop
      
            #position checks, class additions
            if scrollPoint > startTop
              $(scrollElem).addClass "inmotion"
              $(scrollElem).stop().animate
                top: addedMargin
              , 800
            else
              $(scrollElem).removeClass "inmotion"    
          didScroll = false
    ), 10