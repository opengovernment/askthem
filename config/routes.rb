OpenGovernment::Application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'registrations',
    confirmations: 'confirmations',
  }

  root to: 'pages#index'

  resources :users, only: :show
  resources :signatures, only: :create

  scope ':jurisdiction' do
    resources :bills, only: [:index, :show] do
      member do
        get 'sponsors'
      end
    end

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

    resources :subjects, only: [:index, :show]
  end

  match ':jurisdiction' => 'pages#overview', as: :jurisdiction, via: :get
  match 'dashboard' => 'pages#dashboard', as: :dashboard, via: :get
  match 'channel' => 'pages#channel', as: :channel, via: :get
end
