$(".sign-on-user").click ->
  self = $(this)
  $.ajax
    url: "/signatures?question_id=" + self.data("question-id")
    type: "POST"
    success: (resp) ->
      self.after "<a class='sign_on'>Signed On</a>"
      self.hide()
      question_id = self.data("question-id")
      currentCount = $("[data-signature-question-id='" + question_id + "']")
      currentCount.html parseInt(currentCount.html()) + 1
      currentNeeded = $(".question-signatures-needed")
      currentNeeded.html parseInt(currentNeeded.html()) - 1

    error: (resp) ->
      console.log "coundnt save!"

  false
