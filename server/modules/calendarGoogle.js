module.exports = function(knex) {

    'use strict';

    var authGoogle  = require('./authGoogle')( knex ),
        calendar = authGoogle.google.calendar('v3'),
        deferred = require('node-promise').defer;

    function getSelectedCalendarId(userId) {
        var d = deferred();
        knex('users').select('googleSelectedCalendar as googleCalendar').where({ id: userId }).then(function(data) {
            d.resolve(data[0].googleCalendar);
        }).catch(function(err) {
            d.reject(err);
        });
        return d.promise;
    }

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
        getSelectedCalendarId: getSelectedCalendarId,
        getCalendars: getCalendars,
        addEvent: addEvent
    };
};