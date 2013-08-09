$('.sign-on-user').click(function(){
  var self = $(this);
  $.ajax({
      url: self.data('question-path'),
      type: "POST",
      success: function(resp){ 
        self.after("<strong>You're signed on!</strong>");
        self.hide();

        var current_count = parseInt($('.question-signatures').html()) + 1;
        $('.question-signatures').html(current_count);
      },
      error: function(resp){ console.log('coundnt save!')}
  });
  return false;
});