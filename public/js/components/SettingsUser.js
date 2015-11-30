import config from 'public/js/appConfig';
import utils from 'public/js/utils';

class SettingsUser {
    constructor($http) {
        this.$http    = $http;
        // @todo use Map()
        this.defaults = {
            currency: utils.currencyList[0]
        };
    }

    fetch() {
        return this.$http.get(config.getApiUrl() + 'settings/user');
    }
    remove() {
        return localStorage.removeItem('TPMsettings');
    }
    set(data) {
        var _settings = Object.assign( {}, this.defaults, data );
        localStorage.setItem('TPMsettings', JSON.stringify( _settings ));
    }
    get() {
        var settings = JSON.parse( localStorage.getItem('TPMsettings') );
        if ( !settings ) {
            settings = Object.assign( {}, this.defaults );
        }
        return settings;
    }
}
SettingsUser.$inject = ['$http'];

export default SettingsUser;
