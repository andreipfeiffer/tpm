TPM.utils = (function() {

    'use strict';

    return {
        toInt: function(x) {
            var nr = parseInt(x);
            if (isNaN(nr)) {
                return 0;
            }
            return parseInt(x);
        }
    };

}());