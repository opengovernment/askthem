jQuery ($) ->
  $('#facebook').click (event) ->
    event.preventDefault()
    FB.login (response) ->
      if response.authResponse
        $.getJSON '/users/auth/facebook/callback', (html) ->
          $('.admin_nav').html(html)

# @todo geolocation, if city/state found and in US:
# $('#new_user .user_locality').val(locality).hide()
# $('#new_user .user_region').val(region).hide()
