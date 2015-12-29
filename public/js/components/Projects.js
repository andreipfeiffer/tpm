import config from 'public/js/appConfig';

class Projects {
    constructor($resource) {
        this.$resource = $resource;
    }
    http() {
        return this.$resource(
            config.getApiUrl() + 'projects/:id',
            {
                id: '@id'
            },
            {
                'update': { method:'PUT' }
            }
        );
    }
}
Projects.$inject = ['$resource'];

export default Projects;
