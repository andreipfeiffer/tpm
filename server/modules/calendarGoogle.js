module.exports = function(knex) {

    'use strict';

    var authGoogle  = require('./authGoogle')( knex ),
        calendar = authGoogle.google.calendar('v3'),
        deferred = require('node-promise').defer;

    function getCalendars() {
        var d = deferred();
        calendar.calendarList.list({}, function(err, response) {
            if (err) {
                d.reject(err);
            } else {
                d.resolve(response);
            }
        });
        return d.promise;
    }

    return {
        getCalendars: getCalendars
    };
};