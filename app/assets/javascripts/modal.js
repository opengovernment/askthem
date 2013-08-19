$('#overlay').click(function() {
  $(this).fadeOut('fast');
  $('#modal').fadeOut('fast');
});

$('.modal-close').click(function() {
  $('#overlay').fadeOut('fast');
  $('#modal').fadeOut('fast');
});
