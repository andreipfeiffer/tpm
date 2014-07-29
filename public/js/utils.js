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

        getRemainingTime: function(date) {
            var today = moment(),
                // date param always starts at 00:00
                // so we add 19 hours, to set the deadline to 7:00 PM that day
                deadline = moment(date).add('hours', 19),
                timeLeft = deadline.diff(today);

            return {
                days: parseFloat(moment.duration(timeLeft, 'ms').asDays().toFixed(2)),
                text: moment.duration(timeLeft, 'ms').humanize(true)
            };
        }
    };

}());