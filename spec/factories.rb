# https://github.com/thoughtbot/factory_girl/blob/master/GETTING_STARTED.md
FactoryGirl.define do
  factory :metadatum do
    id 'ak'
  end

  factory :bill do
  end

  factory :person do
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

  factory :question do
    state 'ak'
    user
    person
    title 'Question'
    body 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel blandit felis. Morbi nec odio arcu.'

    factory :question_about_bill do
      bill
    end
  end
end
