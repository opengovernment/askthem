# https://github.com/thoughtbot/factory_girl/blob/master/GETTING_STARTED.md
FactoryGirl.define do
  # OpenStates

  # @note If `id` were ever different from `abbreviation`, all `belongs_to
  #   :metadatum` calls would to set `:primary_key`.
  factory :metadatum do
    abbreviation 'anytown'

    after(:build) do |record|
      record._id = record.abbreviation
    end
  end

  factory :bill do
    metadatum
  end

  factory :committee do
    metadatum
  end

  factory :person do
    metadatum


    factory :person_ny_sheldon_silver do
      id "NYL000194"
      given_name "Sheldon"
      last_name "Silver"
      full_name "Sheldon Silver"
      email "speaker@assembly.state.ny.us"
      metadatum { FactoryGirl.create(:metadatum, abbreviation: "ny") }
    end
  end

  factory :vote do
    metadatum
  end

  # Project VoteSmart

  factory :key_vote do
  end

  factory :rating_group do
  end

  factory :rating_scorecard do
    rating_group
  end

  factory :rating do
    rating_group
    rating_scorecard
  end

  # OpenGovernment

  factory :person_detail do
    after(:build) do |record|
      record.person = FactoryGirl.create(:person) unless record.person_id?
    end
  end

  factory :question do
    user
    title 'Question'
    body 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel blandit felis. Morbi nec odio arcu.'

    after(:build) do |record|
      record.person = FactoryGirl.create(:person) unless record.person_id?
    end

    factory :question_about_bill do
      after(:build) do |record|
        record.bill = FactoryGirl.create(:bill) unless record.bill_id?
      end
    end

  end

  factory :signature do
    user
    question
  end

  factory :user do
    sequence(:email) {|n| "user#{n}@example.com" }
    given_name 'John'
    family_name 'Public'
    street_address '148 Lafayette St'
    locality 'New York'
    region 'ny'
    country 'US'
    postal_code '10013'
    password 'password'
    coordinates [-73.9998334, 40.7195898]

    # skip confirmation by default
    after(:build) do |record|
      record.skip_confirmation!
    end
  end

  factory :identity do
    association :user, email: "speaker@assembly.state.ny.us"
    association :person, factory: :person_ny_sheldon_silver
  end
end
