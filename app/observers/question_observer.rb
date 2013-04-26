class QuestionObserver < Mongoid::Observer
  def after_create(question)
    increment(question, :question_count, 1)
  end

  def after_update(question)
    if question.answered_changed?
      if question.answered?
        increment(question, :answered_question_count, 1)
      else
        increment(question, :answered_question_count, -1)
      end
    end
  end

  def after_destroy(question)
    increment(question, :question_count, -1)
    if question.answered?
      increment(question, :answered_question_count, -1)
    end
  end

private

  def increment(question, field, by)
    question.person.inc(field, by)
    question.bill.inc(field, by) if question.bill?
  end
end
