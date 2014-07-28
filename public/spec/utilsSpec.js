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

        describe('statusList', function() {

            it('should be an array with all the project statuses', function() {
                expect( TPM.utils.statusList[0] ).toEqual('on hold');
                expect( TPM.utils.statusList[1] ).toEqual('in progress');
                expect( TPM.utils.statusList[2] ).toEqual('finished');
                expect( TPM.utils.statusList[3] ).toEqual('payed');
            });

        });

        describe('getActiveStatusList', function() {

            it('should return an array with the active statuses only', function() {
                var arr = TPM.utils.getActiveStatusList();
                expect( arr.length ).toBe(2);
                expect( arr[0] ).toEqual('on hold');
                expect( arr[1] ).toEqual('in progress');
            });

        });
    });

})();
