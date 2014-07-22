(function() {

    'use strict';

    describe('TPM.utils', function() {

        describe('toInt', function() {

            it('should return the number value for number parseable values', function() {
                expect( TPM.utils.toInt(10) ).toBe(10);
                expect( TPM.utils.toInt('10') ).toBe(10);
            });

            it('should return "0" if value is "falsey" or not parseable', function() {
                expect( TPM.utils.toInt(0) ).toBe(0);
                expect( TPM.utils.toInt('a') ).toBe(0);
                expect( TPM.utils.toInt(null) ).toBe(0);
                expect( TPM.utils.toInt('null') ).toBe(0);
                expect( TPM.utils.toInt(undefined) ).toBe(0);
                expect( TPM.utils.toInt('undefined') ).toBe(0);
            });

        });
    });

})();
