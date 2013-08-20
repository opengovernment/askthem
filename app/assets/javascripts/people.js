$('.is-verified').hover(function() {
  $('.verified-tooltip', this).addClass('is-showing').removeClass('is-hidden');
}, function() {
  $('.verified-tooltip', this).addClass('is-hidden').removeClass('is-showing');
});
