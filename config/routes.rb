OpenGovernment::Application.routes.draw do
  root to: 'pages#index'

  scope ':jurisdiction' do
    resources :bills, only: [:index, :show]
    resources :committees, only: [:index, :show]
    resources :people, only: [:index, :show]

    resources :questions, only: [:index, :show, :new] do
      collection do
        get :preview
      end
    end
  end

  match ':jurisdiction' => 'pages#overview', as: :jurisdiction, via: :get
end
