OpenGovernment::Application.routes.draw do
  devise_for :users

  root to: 'pages#index'

  scope ':jurisdiction' do
    resources :bills, only: [:index, :show] do
      member do
        get 'sponsors'
      end
    end

    resources :committees, only: [:index, :show]

    resources :people, only: [:index, :show] do
      member do
        get 'bills'
        get 'committees'
        get 'votes'
      end
    end

    resources :questions, only: [:index, :show, :new] do
      collection do
        get :preview
      end
    end
  end

  match ':jurisdiction' => 'pages#overview', as: :jurisdiction, via: :get
end
