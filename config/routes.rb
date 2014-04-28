OpenGovernment::Application.routes.draw do
  resources :blurbs

  devise_for :users, controllers: {
    registrations: 'registrations',
    confirmations: 'confirmations',
    omniauth_callbacks: 'omniauth_callbacks',
    sessions: 'sessions'
  }

  if ENV["SPLASH_AS_HOMEPAGE"]
    root to: 'pages#splash'
    get 'home' => 'pages#index'
  else
    root to: 'pages#index'
  end

  # generate a custom robots.txt
  get 'robots.:format' => 'robots#show'

  get 'splash' => 'pages#splash'
  get 'electeds' => 'pages#splash'
  get 'elected_signup' => 'pages#elected_signup'
  get 'about', to: 'pages#about'
  get 'support', to: 'pages#support'
  get 'faq', to: 'pages#faq'
  get 'map', to: 'pages#map'
  get 'terms-of-service', to: 'pages#terms_of_service'
  get 'privacy-policy', to: 'pages#privacy_policy'

  resources :users, only: :show do
    member do
      get 'signatures'
    end
  end
  resources :signatures, only: :create
  resources :answers, only: [:create, :update]

  resources :identities, only: :update

  scope ':jurisdiction' do
    resources :bills, only: [:index, :show] do
      member do
        get 'sponsors'
      end
    end

    resources :people, only: [:index, :show, :update] do
      member do
        get 'bills'
        get 'committees'
        get 'votes'
        get 'ratings'
      end
    end

    resources :questions, only: [:index, :show, :new, :create, :edit, :update, :destroy] do
      collection do
        get 'preview'
        get 'need_signatures'
        get 'have_answers'
        get 'need_answers'
        get 'recent'
      end
    end

    resources :subjects, only: [:index, :show]

    match 'overview/lower' => 'pages#lower', as: :lower_overview, via: :get
    match 'overview/upper' => 'pages#upper', as: :upper_overview, via: :get
    match 'overview/bills' => 'pages#bills', as: :bills_overview, via: :get
    match 'overview/meetings' => 'pages#meetings', as: :meetings_overview, via: :get
    match 'overview/votes' => 'pages#key_votes', as: :key_votes_overview, via: :get

    get 'map', to: 'pages#map'
  end

  match 'locator' => 'pages#locator', as: :locator, via: :get
  match 'identifier' => 'pages#identifier', as: :identifier, via: :get
  match 'contact_info' => 'pages#contact_info', as: :contact_info, via: :get
  match 'channel' => 'pages#channel', as: :channel, via: :get
  match 'people' => 'people#index', as: :unaffiliated_people, via: :get, jurisdiction: Metadatum::Unaffiliated::ABBREVIATION
  match 'people/:id' => 'people#show', as: :unaffiliated_person, via: :get, jurisdiction: Metadatum::Unaffiliated::ABBREVIATION
  match 'questions' => 'questions#index', as: :unaffiliated_questions, via: :get, jurisdiction: Metadatum::Unaffiliated::ABBREVIATION
  match 'questions/:id' => 'questions#show', as: :unaffiliated_question, via: :get, jurisdiction: Metadatum::Unaffiliated::ABBREVIATION
  match ':jurisdiction' => 'pages#overview', as: :jurisdiction, via: :get
end
