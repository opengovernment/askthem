$(".sign-on-user").click ->
  self = $(this)
  questionId = self.data("question-id")
  $.ajax
    url: "/signatures?question_id=" + questionId
    type: "POST"
    success: (resp) ->
      self.after "<a class='sign_on'>Signed On</a>"
      self.hide()

      question_id = self.data("question-id")

      currentCount = $("[data-signature-question-id='" + question_id + "']")
      currentCount.html parseInt(currentCount.html()) + 1

      currentNeeded = $(".question-signatures-needed")
      if currentNeeded.size() > 0
        currentNeededCount = parseInt(currentNeeded.html()) - 1
        currentNeeded.html currentNeededCount

        if currentNeededCount < 1
          $('.question_progress_count.count_needed').fadeOut('slow')
          $('.progress-bar').fadeOut('slow')

      if $('#modal').size() > 0
        $('#modal').fadeTo('slow', 1)
        $('#overlay').fadeTo('slow', 1)

        if $('.share-button').size() > 0
          $('a.sign_on').fadeOut('slow')
          $('.has-signed').fadeTo('slow', 1)
          $('.sharing-text').fadeTo('slow', 1)
          $('.share-button').fadeTo('slow', 1)
      else
        jurisdiction = $(location).attr('pathname').split('/')[1]
        questionUrl = ""
        if jurisdiction != 'questions' && jurisdiction != 'locator'
          questionUrl = "/#{jurisdiction}"
        questionUrl += "/questions/#{questionId}?share=true"

        window.location.href = questionUrl
    error: (resp) ->
      console.log "coundnt save!"

  false
