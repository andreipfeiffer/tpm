import moment from 'moment';
import utils from 'public/js/utils';

describe('utils', () => {

    describe('toInt', () => {

        it('should return the number value for number parseable values', () => {
            expect( utils.toInt(10) ).toBe(10);
            expect( utils.toInt('10') ).toBe(10);
        });

        it('should return "0" if value is "falsey" or not parseable', () => {
            expect( utils.toInt(0) ).toBe(0);
            expect( utils.toInt('a') ).toBe(0);
            expect( utils.toInt(null) ).toBe(0);
            expect( utils.toInt('null') ).toBe(0);
            expect( utils.toInt(undefined) ).toBe(0);
            expect( utils.toInt('undefined') ).toBe(0);
        });

    });

    describe('isDateFormat', () => {

        it('should return true', () => {
            expect( utils.isDateFormat('2014-12-12') ).toBeTruthy();
            expect( utils.isDateFormat(' 2014-12-12 ') ).toBeTruthy();
        });

        it('should return false', () => {
            expect( utils.isDateFormat('2014 12 12') ).toBeFalsy();
            expect( utils.isDateFormat('204-12-12') ).toBeFalsy();
            expect( utils.isDateFormat('20444-12-12') ).toBeFalsy();
            expect( utils.isDateFormat('2014-2-12') ).toBeFalsy();
            expect( utils.isDateFormat('2014-12-1') ).toBeFalsy();
        });

    });

    describe('statusList', () => {

        it('should be an array with all the project statuses', () => {
            expect( utils.statusList[0] ).toEqual('on hold');
            expect( utils.statusList[1] ).toEqual('in progress');
            expect( utils.statusList[2] ).toEqual('finished');
            expect( utils.statusList[3] ).toEqual('paid');
        });

    });

    describe('getActiveStatusList', () => {

        it('should return an array with the active statuses only', () => {
            var arr = utils.getActiveStatusList();
            expect( arr.length ).toBe(2);
            expect( arr[0] ).toEqual('on hold');
            expect( arr[1] ).toEqual('in progress');
        });

    });

    describe('getInactiveStatusList', () => {

        it('should return an array with the inactive statuses only', () => {
            var arr = utils.getInactiveStatusList();
            expect( arr.length ).toBe(3);
            expect( arr[0] ).toEqual('finished');
            expect( arr[1] ).toEqual('paid');
            expect( arr[2] ).toEqual('cancelled');
        });

    });

    describe('getWeekendDays', () => {

        it('should return the number of weekend days between 2 dates', () => {
            // if the current day is in weekend, the number is higher
            var expected = ( moment().day() === 6 || moment().day() === 0 ) ? 5 : 4;
            // if we pass 2 weeks from now, should work everytime
            var endDate = moment().add(14, 'days').format('YYYY-MM-DD');
            expect( utils.getWeekendDays(endDate) ).toBe( expected );
        });

        it('should return -1 if the end date already passed', () => {
            // if we pass 2 weeks from now, should work everytime
            var endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
            expect( utils.getWeekendDays(endDate) ).toBe(-1);
        });

    });

    describe('getRemainingWorkTime', () => {

        // it('should return a property containing the work days excluding weekends', () => {
            // cannot test this, because it depends on when you run the tests
        // });

        it('should return a property containing the humanized text of period, including weekends', () => {
            // if we pass 2 weeks from now, should work everytime
            var endDate = moment().add(14, 'days').format('YYYY-MM-DD'),
                remaining = utils.getRemainingWorkTime(endDate);

            expect( remaining.textTotal ).toBeDefined();
            expect( remaining.textTotal ).toEqual('in 14 days');
        });

    });

    describe('getPassedTime', () => {

        it('should return a property containing the humanized text of the passed period', () => {
            var passedDate = moment().subtract(5, 'minutes'),
                passed     = utils.getPassedTime( passedDate );

            expect( passed.textTotal ).toBeDefined();
            expect( passed.textTotal ).toEqual('5 minutes ago');
        });

    });

});
