$('#overlay, .modal-close').click(function() {
  $('#overlay, #modal').fadeOut('fast');
});

$('.navigation-modal-open').click(function() {
  $('#overlay, #modal').fadeTo('slow', 1)
});
