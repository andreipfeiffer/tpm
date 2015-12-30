import config from 'public/js/appConfig';

class Projects {

    constructor($resource, $filter) {
        this.$resource = $resource;
        this.$filter   = $filter;
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

    serialize(scope) {
        return Object.assign({}, scope.project, {
            days:          this.getDays(scope),
            dateEstimated: this.getEstimatedDate(scope),
            dateAdded    : this.getFormattedDate(new Date())
        });
    }

    getDays(scope) {
        return scope.hasDeadline ? scope.days : 0;
    }

    getEstimatedDate(scope) {
        if ( !scope.hasDeadline ) {
            return null;
        }
        return this.getFormattedDate(scope.selectedDateEstimated);
    }

    getFormattedDate(date) {
        return this.$filter('date')(date, config.dateFormat);
    }
}
Projects.$inject = ['$resource', '$filter'];

export default Projects;
