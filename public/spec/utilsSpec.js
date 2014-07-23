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

        describe('isDateFormat', function() {

            it('should return true', function() {
                expect( TPM.utils.isDateFormat('2014-12-12') ).toBeTruthy();
                expect( TPM.utils.isDateFormat(' 2014-12-12 ') ).toBeTruthy();
            });

            it('should return false', function() {
                expect( TPM.utils.isDateFormat('2014 12 12') ).toBeFalsy();
                expect( TPM.utils.isDateFormat('204-12-12') ).toBeFalsy();
                expect( TPM.utils.isDateFormat('20444-12-12') ).toBeFalsy();
                expect( TPM.utils.isDateFormat('2014-2-12') ).toBeFalsy();
                expect( TPM.utils.isDateFormat('2014-12-1') ).toBeFalsy();
            });

        });
    });

})();
