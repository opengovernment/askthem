OpenGovernment::Application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'registrations',
    confirmations: 'confirmations',
    omniauth_callbacks: 'omniauth_callbacks',
    sessions: 'sessions'
  }

  root to: 'pages#index'

  get 'splash' => 'pages#splash'
  get 'electeds' => 'pages#splash'
  get 'about', to: 'pages#about'
  get 'support', to: 'pages#support'
  get 'faq', to: 'pages#faq'

  resources :users, only: :show do
    member do
      get 'signatures'
    end
  end
  resources :signatures, only: :create
  resources :answers, only: :create

  resources :identities, only: :update

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
        get 'ratings'
      end
    end

    resources :questions, only: [:index, :show, :new, :create] do
      collection do
        get 'preview'
      end
    end

    resources :subjects, only: [:index, :show]

    match 'overview/lower' => 'pages#lower', as: :lower_overview, via: :get
    match 'overview/upper' => 'pages#upper', as: :upper_overview, via: :get
    match 'overview/bills' => 'pages#bills', as: :bills_overview, via: :get
    match 'overview/meetings' => 'pages#meetings', as: :meetings_overview, via: :get
    match 'overview/votes' => 'pages#key_votes', as: :key_votes_overview, via: :get
  end

  match 'locator' => 'pages#locator', as: :locator, via: :get
  match 'identifier' => 'pages#identifier', as: :identifier, via: :get
  match 'contact_info' => 'pages#contact_info', as: :identifier, via: :get
  match 'channel' => 'pages#channel', as: :channel, via: :get
  match ':jurisdiction' => 'pages#overview', as: :jurisdiction, via: :get
end
