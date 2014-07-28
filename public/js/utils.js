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
        }
    };

}());