# tPM - tiny Project Manager

Personal app that uses the MEAN stack concept, except that "M" is from MySQL, not Mongo.

[![Build Status](https://travis-ci.org/andreipfeiffer/tpm.svg?branch=master)](https://travis-ci.org/andreipfeiffer/tpm)

## Technical Goals Achieved

- RESTful API
- CRUD interfaces
- JWT authentication
- Server integration tests, using Mocha & expect.js
- Client unit tests, using Jasmine & Karma
- Client e2e tests, using Cucumber & Protractor
- Bower components management
- Code linting
- Semver release system
- Travis-CI integration
- Google Calendar integration
- Full Promise-based code
- Custom loader & notification display system, with [angular-feedback](https://github.com/andreipfeiffer/angular-feedback)
- Page transitions
- Build script, for client
- Log server errors
- Reports section
- App Status section, using websockets
- ES6 compliant code
- Redis session store

## Future Goals

- Custom bootstrap theme
- Create new accounts
- Recover password
- Close account
- Login with Google
- Timeline projects display variant
- Offline availability

## Get started

1. start MySQL server
2. `node server`
3. `grunt watch`

## Deploy

1. login to server
2. `git fetch`
3. `rm -rf bower_components`
4. `grunt deploy:<tag>`
