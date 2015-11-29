var isInitialized = false,
    apiUrl = 'http://localhost:3000/';

function _isLocalhost(host) {
    if (
        // desktop browser
        host === 'localhost' ||
        // mobile browser
        host.indexOf('192.168') > -1 ||
        // PhantomJS from karma tests
        host === 'server'
    ) {
        return true;
    }
    return false;
}

export default {
    dateFormat: 'yyyy-MM-dd',

    getApiUrl() {
        return apiUrl;
    },

    setApiUrl(host, port) {
        if ( isInitialized ) {
            return;
        }

        apiUrl = _isLocalhost(host) ? 'http://' + host + ':' + port + '/' : 'http://tpm.upsidedown.ro/';
        isInitialized = true;
    }
};