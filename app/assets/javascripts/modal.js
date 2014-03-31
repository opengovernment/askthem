$('#overlay, .modal-close, .navigation-overlay').click(function() {
  $('#overlay, #modal').fadeOut('fast');
});

$('.navigation-modal-open').click(function() {
  $('.navigation-overlay, .navigation-modal').fadeTo('slow', 1)
});
