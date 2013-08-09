$('.sign-on-user').click(function(){
  var self = $(this);
  $.ajax({
      url: '/signatures?question_id=' + self.data('question-id'),
      type: "POST",
      success: function(resp){ 
        self.after("<a class='sign_on'>Signed On</a>");
        self.hide();

        var question_id = self.data('question-id');
        var current_count = $("[data-signature-question-id='" + question_id + "']");
        current_count.html(parseInt(current_count.html()) + 1);
      },
      error: function(resp){ console.log('coundnt save!')}
  });
  return false;
});