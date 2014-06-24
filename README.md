# AskThem

[![Code Climate](https://codeclimate.com/github/opengovernment/askthem.png)](https://codeclimate.com/github/opengovernment/askthem)
<a href="https://kiwiirc.com/client/irc.freenode.net/?nick=web_guest%7C?#opengovernment"><img src="https://kiwiirc.com/buttons/irc.freenode.net/opengovernment.png" alt="#opengovernment IRC channel" height="18" width="130" style="max-width:100%;"></a>

## Getting Started

We require these to be installed:

* imagemagick
* nodejs
* mongodb # should also be running
* redis # should also be running
* ffmpegthumbnailer # video thumbnailing
* phantomjs # for running the request spec

Depending on your OS , you may also need to install these:

* libxml2-dev
* libxslt-dev
* libmagickwand-dev

In the application's directory, set up Ruby 1.9.3 and required gems:

    rvm 1.9.3 # i.e. switch to ruby 1.9.3, your steps may vary
    bundle

Start the server:

    rails server

In another shell, start [Sidekiq](https://github.com/mperham/sidekiq/) to handle background jobs:

    bundle exec sidekiq -q geocoding

### Setting Up API Keys

You will need a [Sunlight Foundation API key](http://services.sunlightlabs.com/accounts/register/) and a [Project Vote Smart API key](http://votesmart.org/share/api). In development, you should copy and edit `_heroku.rb`:

    cp examples/_heroku.rb config/initializers/_heroku.rb

In production, you should set `SUNLIGHT_API_KEY` and `PROJECT_VOTE_SMART_API_KEY` environment variables. If you are using Heroku, run (replacing `...` with your API keys):

    heroku config:add SUNLIGHT_API_KEY=...
    heroku config:add PROJECT_VOTE_SMART_API_KEY=...

## Getting the data the application relies on (in development only)

You can pull the full data set or a limited data set.

Grabbing the full data set can take more than 24 hours! It's only recommended if what you are working on requires it.

For most developers, the limited data set is sufficient and can be grabbed in under an hour. You choose one or more states that you would like to use as your development data, and the functionality of the application will be complete if you focus on those states.

The sequence of rake tasks to load data will be the same for both options, but you'll need to specify the states you want to limit to during the ones noted with comments.

We recommend Pennsylvania, state code 'pa', as good state for working with the application with a limited data set.

There may also be one or more steps that you should skip for the limited data set. These will be noted, too.

### Specifying one or more states as you limited data set

Choose one or more states you like to limit your data to. During the appropriate rake tasks, you'll pass the ONLY environmental variable with the state codes you want.

Here are a couple examples:

    bundle exec rake some:task ONLY="pa" # this says only give me the Pennsylvania state data

    bundle exec rake some:task ONLY="pa,vt" # this says only give me the Pennsylvania and Vermont state data, state codes are comma separated

Rake tasks that can have their data limited will be marked below. If you want the full data, DO NOT add the "ONLY" variable.

### Loading the basic data steps

Get the necessary supporting data (work-in-progress, will change):

    bundle exec rake openstates:json:update # takes ONLY value to limit data, recommended for most developers
    bundle exec rake openstates:add_metadata

At this point we also need to do a step from the Mongo shell to get our data in order:

   mongo askthem_development # development db name, adjust to suit
   > db.legislators.find().forEach( function(doc) { doc._type = "StateLegislator" ;  db.people.insert(doc) } );
   > db.legislators.drop()

Then resume importing data:

    bundle exec rake congress:api:download:legislators
    bundle exec seed_cities:load
    bundle exec rake db:mongoid:create_indexes

### Influence Explorer

You can import Influence Explorer data on a yearly basis.

1. Get biographies from the Influence Explorer API (a third of OpenStates legislators have biographies)

        bundle exec rake influenceexplorer:biographies

### Project VoteSmart

You can import Project VoteSmart people on a yearly basis. Ratings are added regularly, though not every day, so the others should run on a weekly basis.

1. Match OpenStates legislators with Project VoteSmart officials

        bundle exec rake projectvotesmart:people

1. Get Project VoteSmart bills

        bundle exec rake projectvotesmart:bills # takes ONLY value to limit data, recommended for most developers

1. Get Project VoteSmart special interest groups

        bundle exec rake projectvotesmart:special_interest_groups # takes ONLY value to limit data, recommended for most developers

1. Get Project VoteSmart special interest group scorecards

        bundle exec rake projectvotesmart:scorecards

1. Get Project VoteSmart special interest group scorecard ratings

        bundle exec rake projectvotesmart:ratings # skip unless you want to work with the full data set!

## Troubleshooting

* If you ever receive an error that includes "can't find special index: 2d..." or similar, someone has added a new index and you need to rebuild your indexes:

```
bundle exec rake db:mongoid:create_indexes
```

## Bugs? Questions?

This project's main repository is on GitHub: [http://github.com/opengovernment/opengovernment-local](http://github.com/opengovernment/opengovernment-local), where your contributions, forks, bug reports, feature requests, and feedback are greatly welcomed.

Copyright (c) 2012-2014 Participatory Politics Foundation, released under the open-source AGPLv3 license.
