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

        statusList: ['on hold','in progress','finished','payed'],

        getActiveStatusList: function() {
            return [
                this.statusList[0],
                this.statusList[1]
            ];
        },

        getRemainingTime: function(_deadline) {
            var result = {},
                today = moment(),
                weekendDays = this.getWeekendDays( _deadline ),
                // deadline always starts at 00:00
                // so we add 19 hours, to set the deadline to 7:00 PM that day
                deadline = moment(_deadline).add('hours', 19),
                timeLeft = moment.duration(deadline.diff(today), 'ms');

            result.weekendDays = weekendDays;
            result.textTotal = timeLeft.humanize(true);
            result.daysWork = timeLeft.subtract(weekendDays, 'days').asDays();

            return result;
        },

        getWeekendDays: function(deadline) {
            var nr = 0,
                dateStart = moment(),
                dateEnd = moment(deadline);

            if ( dateStart.isAfter(dateEnd, 'day') ) {
                return nr;
            }

            while ( !dateStart.isAfter(dateEnd, 'day') ) {
                if ( dateStart.day() === 6 || dateStart.day() === 0 ) {
                    nr += 1;
                }
                dateStart.add('days', 1);
            }

            return nr;
        }
    };

}());