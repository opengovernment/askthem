# Open Government: Application

## Getting Started

Install or update dependencies:

    rvm 1.9.3
    bundle

Start the server:

    rails server

## Pulling Data

Get the latest data from OpenStates:

    ./script/openstates.sh
    rake db:mongoid:create_indexes

Get biographies from the Influence Explorer API (a third of OpenStates legislators have biographies):

    bundle exec rake influenceexplorer:biographies

## Data Quality

We provide a number of scripts for checking the quality and consistency of a Billy database. You can run e.g. the `code-lists.js` validator with:

    mongo DATABASE_NAME script/sanity/helper.js script/sanity/code-lists.js

To run all the scripts, do:

    mongo DATABASE_NAME script/sanity/helper.js script/sanity/{code-lists.js,counts.js,denormalization.js,foreign-keys.js,hierarchy.js,manual-review.js,miscellaneous.js}

## Bugs? Questions?

This project's main repository is on GitHub: [http://github.com/opengovernment/opengovernment-local](http://github.com/opengovernment/opengovernment-local), where your contributions, forks, bug reports, feature requests, and feedback are greatly welcomed.

Copyright (c) 2012 Participatory Politics Foundation, released under the MIT license
