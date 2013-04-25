class SignatureObserver < Mongoid::Observer
  def after_create(signature)
    signature.question.inc(:signature_count, 1)
  end

  def after_destroy(signature)
    signature.question.inc(:signature_count, -1)
  end
end
