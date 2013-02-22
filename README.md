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

## Bugs? Questions?

This project's main repository is on GitHub: [http://github.com/opengovernment/opengovernment-local](http://github.com/opengovernment/opengovernment-local), where your contributions, forks, bug reports, feature requests, and feedback are greatly welcomed.

Copyright (c) 2012 Participatory Politics Foundation, released under the MIT license
