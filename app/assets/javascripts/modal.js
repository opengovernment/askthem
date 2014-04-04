$('#overlay, .modal-close, .navigation-overlay').click(function() {
  $('#overlay, #modal, .navigation-overlay, .navigation-modal').fadeOut('fast');
});

$('.navigation-modal-open').click(function() {
  $('.navigation-overlay, .navigation-modal, i.icon-remove').fadeTo('slow', 1)
});
