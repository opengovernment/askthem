module QuestionsHelper
  # TODO: spec
  def step_class_for(step, relevant_steps)
    raw('class="not-first-step"') if relevant_steps.first.to_s != step
  end
end
