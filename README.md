# tpm - Tiny Project Manager

Personal app that uses the MEAN stack concept (need to switch from MySQL to Mongo) for educational purposes.

[![Build Status](https://travis-ci.org/andreipfeiffer/tpm.svg?branch=master)](https://travis-ci.org/andreipfeiffer/tpm)

## Achieved Goals

* RESTful API
* CRUD interfaces
* Token authentication
* Server unit-tests, using Mocha
* Client unit-tests, using Jasmine
* Client e2e testing, using Protractor
* Bower components management
* Code linting
* Travis-CI integration

## Short term To-dos

* Notify if work days + current date = deadline (-2, -5, etc)
* Dashboard, with color coding depending on "urgency"
* Log status change
* Projects "finished" but not "payed", that passed X days
* Check for duplicate names on server
* Separate 3rd party services & directives (like modals) and exclude them from test coverage

## Future Goals

* Make it look not-shitty
* Migrate from MySQL to Mongo using Mongoose
* Update to express.js 4.0
* Websockets messaging
* Full server unit-tests
* Offline availability
* Mobile optimizations
* Build and optimize resources
