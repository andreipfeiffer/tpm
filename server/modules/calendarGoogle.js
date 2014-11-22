module.exports = function(knex) {

    'use strict';

    var authGoogle  = require('./authGoogle')( knex ),
        calendar = authGoogle.google.calendar('v3'),
        Defer = require('node-promise').defer;

    function getCalendars() {
        var deferred = Defer();
        calendar.calendarList.list({}, function(err, response) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(response);
            }
        });
        return deferred.promise;
    }

    return {
        getCalendars: getCalendars
    };
};