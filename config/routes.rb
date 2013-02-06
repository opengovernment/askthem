OpenGovernment::Application.routes.draw do
  resources :questions, only: [:index, :show, :new] do
    collection do
      get :preview
    end
  end

  root to: 'questions#index'
end
