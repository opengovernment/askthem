module QuestionsHelper
  # TODO: spec
  def step_class_for(step, relevant_steps)
    raw('class="not-first-step"') if relevant_steps.first.to_s != step
  end

  def question_progress_percent(question)
    question.signature_count.to_f / question.person.signature_threshold.to_f * 100.0
  end
end
