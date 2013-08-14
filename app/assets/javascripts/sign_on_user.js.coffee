$(".sign-on-user").click ->
  self = $(this)
  $.ajax
    url: "/signatures?question_id=" + self.data("question-id")
    type: "POST"
    success: (resp) ->
      self.after "<a class='sign_on'>Signed On</a>"
      self.hide()
      question_id = self.data("question-id")
      current_count = $("[data-signature-question-id='" + question_id + "']")
      current_count.html parseInt(current_count.html()) + 1

    error: (resp) ->
      console.log "coundnt save!"

  false