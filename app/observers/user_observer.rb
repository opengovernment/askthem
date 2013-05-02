class UserObserver < Mongoid::Observer
  def after_create(user)
    Resque.enqueue(User, user.id, 'geocode')
  end
end
