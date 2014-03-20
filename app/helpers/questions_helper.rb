module QuestionsHelper
  def step_class_for(step, relevant_steps)
    raw('class="not-first-step"') if relevant_steps.first.to_s != step
  end

  def question_progress_percent(question)
    question.signature_count.to_f / question.person.signature_threshold.to_f * 100.0
  end

  def current_url_without_share
    @current_url_without_share ||= current_url.sub("share=true", "share=false")
  end

  def current_url_without_share_encoded
    @current_url_without_share_encoded ||= URI.escape(current_url_without_share)
  end

  def facebook_question_share(options = {})
    url = "https://www.facebook.com/sharer.php?u=#{current_url_without_share_encoded}"
    text = options.delete(:text) || "Share on Facebook"
    html = raw("<i class=\"icon-facebook\"></i> #{text}")

    link_to html, url, options
  end

  def twitter_question_share(options = {})
    url = "https://twitter.com/share?text=#{options.delete(:tweet_text)}&"
    url += "url=#{current_url_without_share_encoded}"

    text = options.delete(:text) || "Twitter"
    html = raw("<i class=\"icon-twitter\"></i> #{text}")

    link_to html, raw(url), options
  end

  def google_plus_question_share(options = {})
    url = "https://plus.google.com/share?url=#{current_url_without_share_encoded}"
    text = options.delete(:text) || "Google Plus"
    html = raw("<i class=\"icon-google-plus\"></i> #{text}")

    link_to html, url, options
  end

  def mail_body_for(question)
    preface = if question.answered?
                "See #{question.person.name}'s answer on AskThem, a new platform for questions-and-answers with public figures:"
              else
                "Sign on to this question on AskThem, a new platform for questions-and-answers with public figures.

When it reaches the signature threshold, AskThem will deliver it to its target and ask for a public response:"
              end

    URI.escape("#{preface}


#{question.title}

#{current_url_without_share}


AskThem is free, open-source, and non-profit, working to change the civic culture to ask good questions of people in power.")
  end

  def mail_question_share(question, options = {})
    url = "mailto:?subject=#{options.delete(:subject)}&body=#{mail_body_for(question)}"
    text = options.delete(:text) || "Email"
    html = raw("<i class=\"icon-envelope-alt\"></i> #{text}")

    link_to html, raw(url), options
  end

  def where_from_for(user)
    return unless user.locality.present? || user.region.present?

    where_from_parts = []
    where_from_parts << user.locality if user.locality.present?
    where_from_parts << user.region.upcase if user.region.present?
    ", of #{where_from_parts.join(", ")}"
  end

  def tweet_text
    name = if @question.person.twitter_id
             "@#{@question.person.twitter_id}"
           else
             @question.person.name
           end


    text = if @question.answered?
             "Share #{name}'s answer"
           else
             "Support my question to #{name}"
           end

    text += " on @AskThemPPF: #{URI.escape(truncate(@question.title, length: 57, separator: " "))}"
  end
end
