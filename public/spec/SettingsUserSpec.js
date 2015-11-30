import 'angular';
import 'angular-mocks';
import 'public/js/app';
import utils from 'public/js/utils';
import customMatchers from 'public/spec/_matchers';

var defaultSettings = {
    currency: utils.currencyList[0]
};
var newSettings = {
    currency: 'AAA',
    another : 'BBB'
};

describe('SettingsUser', () => {

    beforeEach(angular.mock.module('tpm'));

    var SettingsUser;

    beforeEach(inject((_SettingsUser_) => {
        SettingsUser = _SettingsUser_;
        jasmine.addMatchers( customMatchers );
    }));

    afterEach(() => {
        SettingsUser.remove();
    });


    /*it('should fetch() current Settings', () => {
        // this test is useless, there is nothing to test
    });*/

    it('should get default Settings', () => {
        expect( SettingsUser.get() ).toEqualDeep( defaultSettings );
    });

    it('should set new Settings', () => {
        SettingsUser.set( newSettings );
        expect( SettingsUser.get() ).toEqualDeep( newSettings );
    });

    it('should remove SettingsUser', () => {
        SettingsUser.set( newSettings );
        SettingsUser.remove();

        expect( SettingsUser.get() ).toEqualDeep( defaultSettings );
    });

});
