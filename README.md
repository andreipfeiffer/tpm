# tPM - tiny Project Manager

Personal app that uses the MEAN stack concept, except that "M" is from MySQL, not Mongo.

[![Build Status](https://travis-ci.org/andreipfeiffer/tpm.svg?branch=master)](https://travis-ci.org/andreipfeiffer/tpm)

## Achieved Goals

* RESTful API
* CRUD interfaces
* JWT authentication
* Server unit-tests, using Mocha & expect.js
* Client unit-tests, using Jasmine & Karma
* Client e2e testing, using Protractor
* Bower components management
* Code linting
* Semver release system
* Travis-CI integration
* Google Calendar integration
* Full Promise-based code
* Custom loader & notification display system, with [angular-feedback](https://github.com/andreipfeiffer/angular-feedback)
* Page transitions
* Build script, for client
* Log server errors

## Short term To-dos

* Filter Projects by Client
* Sort projects based on various criteria
* Projects "finished" but not "payed", that passed X days
* Handle all server errors on client: 4xx (verbosely) and 5xx (generic, silent)

## Future Goals

* Custom bootstrap theme
* Reports
* Create new accounts
* Recover password
* Close account
* Login with Google
* Timeline projects display variant
* Offline availability
* Websockets messaging
