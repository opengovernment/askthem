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
    bottomStop = ''
    
    $(window).scroll ->
      didScroll = true

    #to avoid firing functions on every scroll event, we're setting an interval to check if we've scrolled.
    setInterval (->
      if didScroll && $(window).height() > $(scrollElem).outerHeight()
        if scrollElem

          #catch the windows scrolled point
          scrollPoint = $(window).scrollTop()
          
          #position checks, class additions
          if scrollPoint > startTop
            $(scrollElem).addClass "inmotion"
          else
            $(scrollElem).removeClass "inmotion"
          
          bottomStop = $('section.question').offset().top + $('section.question').height()
          scrollElemBoundary = scrollPoint + $(scrollElem).outerHeight()
          
          if scrollElemBoundary >= bottomStop
            $(scrollElem).addClass "magnetize"
          else
            $(scrollElem).removeClass "magnetize"
            
        didScroll = false
    ), 10