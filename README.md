# tPM - tiny Project Manager

Personal app that uses the MEAN stack concept, except that "M" is from MySQL, not Mongo.

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
* Google Calendar integration
* Promise-based requests
* Custom loader & notification display system, with [angular-feedback](https://github.com/andreipfeiffer/angular-feedback)

## Short term To-dos

* Projects "finished" but not "payed", that passed X days
* Separate 3rd party services & directives (like modals) and exclude them from test coverage
* Handle all server errors on client: 4xx (verbosely) and 5xx (generic, silent)

## Future Goals

* Custom bootstrap theme
* Full server unit-tests
* Build and optimize resources
* Reports
* Offline availability
* Create new accounts
* Recover password
* Close account
* Websockets messaging
