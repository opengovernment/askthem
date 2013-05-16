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

  getTwitter = (elem) ->
    $.ajax
      url: "http://api.twitter.com/1/users/lookup.json?screen_name=" + $(elem).val().slice(1) + "&callback=?"
      type: "GET"
      dataType: "json"
      success: (data) ->
        $("form.twitter .select-person li h2").html data[0].name
        $("form.twitter div.avatar img").attr 'src', data[0].profile_image_url
        $("form.twitter .select-person div.person-info p").html data[0].description
        $("form.twitter .select-person li").fadeTo(300, 1)
        

  $("#twitter").blur(->      
    if $(this).val()[0] is "@"
      getTwitter($(this))
    else
      $(this).addClass 'invalid'
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