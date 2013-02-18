OpenGovernment::Application.routes.draw do
  root to: 'pages#index'

  resources :questions, only: [:index, :show, :new] do
    collection do
      get :preview
    end
  end
end
