class SessionService {
    constructor($http) {
        this.$http = $http;
    }

    setAuthToken(token) {
        localStorage.setItem('TPMtoken', token);
        this.$http.defaults.headers.common['Authorization'] = token;
    }
    getAuthToken() {
        return localStorage.getItem('TPMtoken');
    }
    removeAuthToken() {
        return localStorage.removeItem('TPMtoken');
    }
}
SessionService.$inject = ['$http'];

export default SessionService;
