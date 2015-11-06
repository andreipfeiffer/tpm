TPM.utils = (function() {

    'use strict';

    return {
        toInt: function(x) {
            var nr = parseInt(x);
            if (isNaN(nr)) {
                return 0;
            }
            return parseInt(x);
        },

        isDateFormat: function(str) {
            return (/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/).test(str.trim());
        },

        statusList: ['on hold','in progress','finished','paid'],

        getActiveStatusList: function() {
            return [
                this.statusList[0],
                this.statusList[1]
            ];
        },

        getInactiveStatusList: function() {
            return [
                this.statusList[2],
                this.statusList[3]
            ];
        },

        getRemainingTime: function(_deadline) {
            var today = moment(),
                weekendDays = this.getWeekendDays( _deadline ),
                // deadline always starts at 00:00
                // so we add 19 hours, to set the deadline to 7:00 PM that day
                deadline = moment(_deadline).add('hours', 19);

            this.setTodayHour(today);
            var timeLeft = moment.duration(deadline.diff(today), 'ms');

            return {
                weekendDays : weekendDays,
                textTotal   : timeLeft.humanize(true),
                daysWork    : this.getRemainingDays(timeLeft, weekendDays)
            };
        },

        getWeekendDays: function(_deadline) {
            var nr = 0,
                dateStart = moment(),
                dateEnd = moment(_deadline);

            if ( dateStart.isAfter(dateEnd, 'day') ) {
                return -1;
            }

            while ( !dateStart.isAfter(dateEnd, 'day') ) {
                if ( dateStart.day() === 6 || dateStart.day() === 0 ) {
                    nr += 1;
                }
                dateStart.add('days', 1);
            }

            return nr;
        },

        getRemainingDays: function(timeLeft, weekendDays) {
            if (weekendDays > 0) {
                return timeLeft.subtract(weekendDays, 'days').asDays();
            }

            // if weekendDays is -1, we don't substract
            return timeLeft.asDays();
        },

        /**
         * If the current day passed 14:00 o'clock, consider the day "finished",
         * otherwise, consider still available.
         *
         * @param  {Object Moment}   today   current day object
         */
        setTodayHour: function(today) {
            var h = 10;
            if (today.hour() > 14) {
                h = 19;
            }
            today.hour(h);
        }
    };

}());