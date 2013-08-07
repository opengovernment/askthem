# Open Government: Application

[![Build Status](https://secure.travis-ci.org/opengovernment/opengovernment-app.png)](http://travis-ci.org/opengovernment/opengovernment-app)
[![Dependency Status](https://gemnasium.com/opengovernment/opengovernment-app.png)](https://gemnasium.com/opengovernment/opengovernment-app)
[![Coverage Status](https://coveralls.io/repos/opengovernment/opengovernment-app/badge.png?branch=master)](https://coveralls.io/r/opengovernment/opengovernment-app)
[![Code Climate](https://codeclimate.com/github/opengovernment/opengovernment-app.png)](https://codeclimate.com/github/opengovernment/opengovernment-app)
<a href="https://kiwiirc.com/client/irc.freenode.net/?nick=web_guest%7C?#opengovernment"><img src="https://kiwiirc.com/buttons/irc.freenode.net/opengovernment.png" alt="#opengovernment IRC channel" height="18" width="130" style="max-width:100%;"></a>

## Getting Started

We require these to be installed:

* imagemagick
* nodejs
* mongodb # should also be running
* redis # should also be running

Depending on your OS , you may also need to install these:

* libxml2-dev
* libxslt-dev
* libmagickwand-dev

In the application's directory, set up Ruby 1.9.3 and required gems:

    rvm 1.9.3 # i.e. switch to ruby 1.9.3, your steps may vary
    bundle

Start the server:

    rails server

### Setting Up API Keys

You will need a [Sunlight Foundation API key](http://services.sunlightlabs.com/accounts/register/) and a [Project Vote Smart API key](http://votesmart.org/share/api). In development, you should copy and edit `_heroku.rb`:

    cp examples/_heroku.rb config/initializers/_heroku.rb

In production, you should set `SUNLIGHT_API_KEY` and `PROJECT_VOTE_SMART_API_KEY` environment variables. If you are using Heroku, run (replacing `...` with your API keys):

    heroku config:add SUNLIGHT_API_KEY=...
    heroku config:add PROJECT_VOTE_SMART_API_KEY=...

## Pulling Data (in development only)

Get the necessary supporting data (work-in-progress, will change):

    bundle exec rake openstates:json:update
    bundle exec rake openstates:add_metadata
    bundle exec rake congres:api:download:legislators
    bundle exec rake db:mongoid:create_indexes

### Influence Explorer

You can import Influence Explorer data on a yearly basis.

1. Get biographies from the Influence Explorer API (a third of OpenStates legislators have biographies)

    bundle exec rake influenceexplorer:biographies

### Project VoteSmart

You can import Project VoteSmart people on a yearly basis. Ratings are added regularly, though not every day, so the others should run on a weekly basis.

1. Match OpenStates legislators with Project VoteSmart officials

        bundle exec rake projectvotesmart:people

1. Get Project VoteSmart special interest groups

        bundle exec rake projectvotesmart:special_interest_groups

1. Get Project VoteSmart special interest group scorecards

        bundle exec rake projectvotesmart:scorecards

1. Get Project VoteSmart special interest group scorecard ratings

        bundle exec rake projectvotesmart:ratings

## Data Quality

We provide a number of scripts for checking the quality and consistency of a Billy database. You can run e.g. the `code-lists.js` validator with:

    mongo DATABASE_NAME script/sanity/helper.js script/sanity/code-lists.js

To run all the scripts, do:

    mongo DATABASE_NAME script/sanity/helper.js script/sanity/{code-lists.js,counts.js,denormalization.js,foreign-keys.js,hierarchy.js,manual-review.js,miscellaneous.js}

## Bugs? Questions?

This project's main repository is on GitHub: [http://github.com/opengovernment/opengovernment-local](http://github.com/opengovernment/opengovernment-local), where your contributions, forks, bug reports, feature requests, and feedback are greatly welcomed.

Copyright (c) 2012 Participatory Politics Foundation, released under the MIT license
