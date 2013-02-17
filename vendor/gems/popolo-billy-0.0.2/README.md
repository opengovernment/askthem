# Billy integration for Popolo

[![Build Status](https://secure.travis-ci.org/opennorth/popolo-billy.png)](http://travis-ci.org/opennorth/popolo-billy)
[![Dependency Status](https://gemnasium.com/opennorth/popolo-billy.png)](https://gemnasium.com/opennorth/popolo-billy)
[![Code Climate](https://codeclimate.com/badge.png)](https://codeclimate.com/github/opennorth/popolo-billy)

This engine makes it possible for a [Popolo](https://github.com/opennorth/popolo) Rails application to read legislative information scraped with the Sunlight Foundation's [Billy](http://billy.readthedocs.org/en/latest/).

## Getting Started

In your [Popolo](https://github.com/opennorth/popolo) Rails application, add the `popolo-billy` gem to your `Gemfile`:

    gem 'popolo-billy'

If you're using OpenStates data, create an initializer, e.g. `config/initializers/popolo-billy.rb`, with the contents:

    Popolo::Billy.level_field = 'state'

Now, and each time a new jurisdiction is added to Billy, run:

    bundle exec FORCE=yes rake popolo:billy

To prompt for confirmation before creating any document, run the Rake task without `FORCE=yes`.

## Challenges

* Billy stores information on multiple organizations within each document of its `metadata` collection, instead of one document per organization as in Popolo's `organizations` collection.
* Billy has no separate collection for people's positions within organizations as in Popolo's `posts` collection, and instead stores this information in the `districts` collection.
* Popolo embeds addresses in Post documents, but Billy embeds addresses in Legislator documents.

## Solution

This engine creates field aliases on Popolo models so that a Popolo app can read legislative information scraped with Billy.

To avoid writing to any of Billy's collections, the engine overrides:

* `Person#posts` to create a list of posts
* `Post#person` to look up the person
* `Person#memberships` to create a list of memberships
* `Organization#memberships` to create a list of memberships
* `Post#addresses` to look up the person and create a list of addresses

Each time a new jurisdiction is added to Billy, run `bundle exec rake popolo:billy` to:

* Create organizations for each legislature and chamber in the `metadata` collection and each party in the `legislators` collection
* Create posts for elected positions within organizations according to the `districts` collection
* Create any additional posts according to the roles fields on legislator documents, e.g. mayors
* Raise an error if the Billy database is inconsistent, or if there are more organizations or posts than expected in Popolo

## Tests

No specs have been written, because the correctness of the integration code depends on what real Billy databases look like; any mock Billy database built for testing purposes would encode the same assumptions made by the integration code as to what real Billy databases look like. If a minimal, reference Billy database becomes available, specs can be written.

## Issues

* Billy conflates district names with post names, e.g. in the case of [DC](https://github.com/sunlightlabs/openstates/blob/master/manual_data/districts/dc.csv) in [OpenStates](openstates.org), resulting in incorrect district names.

## Bugs? Questions?

This engine's main repository is on GitHub: [http://github.com/opennorth/popolo-billy](http://github.com/opennorth/popolo-billy), where your contributions, forks, bug reports, feature requests, and feedback are greatly welcomed.

## Acknowledgements

This gem is developed by [Open North](http://www.opennorth.ca/) through a partnership with the [Participatory Politics Foundation](http://www.participatorypolitics.org/).

Copyright (c) 2013 Open North Inc., released under the MIT license
