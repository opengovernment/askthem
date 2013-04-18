jQuery ($) ->
  $('#new_registration #user_given_name,#edit_registration #user_given_name,#new_session #user_email,#new_password #user_email,#edit_password #user_password').focus()

  $('#facebook').click (event) ->
    event.preventDefault()
    FB.login (response) ->
      if response.authResponse
        $.getJSON '/users/auth/facebook/callback', (html) ->
          $('.admin_nav').html(html)

# @todo geolocation, if city/state found and in US:
# $('#new_user .user_locality').val(locality).hide()
# $('#new_user .user_region').val(region).hide()
