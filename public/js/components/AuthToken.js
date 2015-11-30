class AuthToken {
    constructor($http) {
        this.$http = $http;
    }

    set(token) {
        localStorage.setItem('TPMtoken', token);
        this.$http.defaults.headers.common['Authorization'] = token;
    }
    get() {
        return localStorage.getItem('TPMtoken');
    }
    remove() {
        this.$http.defaults.headers.common['Authorization'] = '';
        return localStorage.removeItem('TPMtoken');
    }
}
AuthToken.$inject = ['$http'];

export default AuthToken;
