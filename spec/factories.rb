# https://github.com/thoughtbot/factory_girl/blob/master/GETTING_STARTED.md
FactoryGirl.define do
  # OpenStates

  factory :metadatum do
    abbreviation 'anytown'
  end

  factory :bill do
    metadatum
  end

  factory :committee do
    metadatum
  end

  factory :person do
    metadatum
  end

  factory :vote do
    metadatum
  end

  # Project VoteSmart

  factory :rating_group do
  end

  factory :rating_scorecard do
    rating_group
  end

  factory :rating do
    rating_group
    rating_scorecard

    after(:build) do |record|
      record.person = FactoryGirl.create(:person)
    end
  end

  # OpenGovernment

  factory :person_detail do
    after(:build) do |record|
      record.person = FactoryGirl.create(:person)
    end
  end

  factory :question do
    user
    title 'Question'
    body 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel blandit felis. Morbi nec odio arcu.'

    after(:build) do |record|
      record.person = FactoryGirl.create(:person)
    end

    factory :question_about_bill do
      after(:build) do |record|
        record.bill = FactoryGirl.create(:bill)
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
    street_address '1 Main St'
    locality 'Anytown'
    region 'ak'
    country 'US'
    postal_code '11111'
    password 'password'
  end
end
