var TPM = TPM || {};

(function() {

    'use strict';

    TPM.customMatchers = {
        toEqualDeep: function(util, customEqualityTesters) {
            return {
                compare: function(actual, expected) {
                    var result = {};

                    result.pass = angular.equals(actual, expected);

                    if (result.pass) {
                        result.message = actual + ' Deep Equals: ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to Equal Deep: ' + expected;
                    }

                    return result;
                }
            };
        }
    };

})();
