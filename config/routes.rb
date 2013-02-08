OpenGovernment::Application.routes.draw do
  mount Popolo::Engine => '/'

  resources :questions, only: [:index, :show, :new] do
    collection do
      get :preview
    end
  end

  root to: 'popolo/organizations#index'
end
