jQuery ($) ->
  $('#summary').focus()
  $('textarea').css('overflow', 'hidden').autogrow()

  $('#summary').keyup ->
    $('.summary_count').text($(this).attr('maxlength') - $('#summary').val().length)

  popup = (event, height) ->
    event.preventDefault()
    window.open $(this).attr('href'), null,
      'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=' + height + ',left=' + Math.round((screen.width - 550) / 2) + ',top=' + Math.max(0, Math.round((screen.height - height) / 2))

  $('.icon-facebook').click (event) ->
    popup.call(this, event, 270) # auto-resizes

  $('.icon-twitter').click (event) ->
    popup.call(this, event, 270)

  $('.icon-google-plus').click (event) ->
    popup.call(this, event, 227) # auto-resizes

  $('time[data-time-ago]').timeago()

  # <%# @todo JM to connect this to accounts that may be officials on OG %> 

  $("#twitter").keyup(->
    #charCounter this, $(".charCounter"), 140
    if $(this).val()[0] is "@"
      $.ajax
        url: "http://api.twitter.com/1/users/lookup.json?screen_name=" + $(this).val().slice(1) + "&callback=?"
        type: "GET"
        dataType: "json"
        success: (data) ->
          console.log(data[0].description)
          #$(".user_bio").html data[0].description
          #$(".user_bio").attr "data", data[0].description

    else
      #$(".user_bio").html $(this).val()
      #$(".user_bio").attr "data", $(this).val()
  )
  
  $('span.toggle a').click (event) ->
    event.preventDefault()
    if $(this).hasClass('twitter') and !$(this).hasClass('active')
      $('form.address_lookup').hide();
      $('form.twitter').show();
    else
      if $(this).hasClass('address_lookup') and !$(this).hasClass('active')
        $('form.twitter').hide();
        $('form.address_lookup').show();
      
    if !$(this).hasClass('active')
      $('span.toggle a.active').removeClass('active icon-ok')
      $(this).addClass('active icon-ok')