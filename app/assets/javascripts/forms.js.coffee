togglePeopleSelect = (elem) ->
  if $(elem).children('div.select_box').children("input:radio").prop("checked") is false
    $(elem).siblings("li").removeClass("selected").addClass "deselected"
    $(elem).children('div.select_box').children("input:radio").prop "checked", true
    $(elem).addClass("selected").removeClass "deselected"

$ ->
  $(".people-list.select-person li").click ->
    togglePeopleSelect this

  if $('div.actions.scroll_this').length

    responsiveLimit = ''
    didScroll = false
    scrollElem = $('div.actions.scroll_this')
    scrollPoint = ''
    startTop = $(scrollElem).offset().top
    bottomStop = ''

    if $(document).width() <= 420
      responsiveLimit = true
    else
      responsiveLimit = false

    $(window).scroll ->
      didScroll = true

    #to avoid firing functions on every scroll event, we're setting an interval to check if we've scrolled.
    setInterval (->
      if responsiveLimit == false
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

  #@todo JM delete/modify this when ajax replaces official lookup on Q&A flows
  fieldValid = {}

  if $('section.question ol.people-list.select-person').length
    $("article form input").blur ->

      $("article form fieldset:eq(0) :text, article form fieldset:eq(0) select").each (int) ->
        unless $(this).val() is ""
          fieldValid['field_' + int] = true
        else
          fieldValid['field_' + int] = false

      for elem of fieldValid
        return false if fieldValid[elem] is false

      #animation for loading in officials
      officialCount = $('section.question ol.people-list.select-person li').length
      iterater = 0

      #load in header and slide to it first
      $('section.question label.select-person').fadeTo 100, 1

      selectRecipient = $("section.question label.select-person").offset().top      

      $('body').animate
        scrollTop: selectRecipient
      , 300

      #then load in officials
      showOfficials = setInterval(->
        if iterater < officialCount
          $("section.question ol.people-list.select-person li:eq(" + iterater + ")").fadeTo 90, 1
          iterater++
        else
          window.clearInterval showOfficials
      , 10)
