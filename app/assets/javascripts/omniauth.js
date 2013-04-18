(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

$(function () {
  $('#facebook').click(function (event) {
    event.preventDefault();
    FB.login(function (response) {
      if (response.authResponse) {
        $.getJSON('/users/auth/facebook/callback', function (html) {
          $('.admin_nav').html(html);
        });
      }
    });
  });
});
