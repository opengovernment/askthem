OpenGovernment::Application.routes.draw do
  root to: 'pages#index'

  mount Popolo::Engine => '/'

  resources :questions, only: [:index, :show, :new] do
    collection do
      get :preview
    end
  end
end
