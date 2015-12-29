import angular from 'angular';
import config from 'public/js/appConfig';
import AuthToken from 'public/js/components/AuthToken';
import SettingsUser from 'public/js/components/SettingsUser';
import ProjectsModal from 'public/js/components/ProjectsModal';
import Projects from 'public/js/components/Projects';

export default angular.module('TPM.Services', ['ngResource'])

    .factory('ProjectsClientService', ['$http', '$resource', ($http, $resource) => {
        return $resource(
            config.getApiUrl() + 'projects/client/:id',
            {
                id: '@id'
            }
        );
    }])

    .factory('ClientsService', ['$resource', ($resource) => {
        return $resource(
            config.getApiUrl() + 'clients/:id',
            {
                id: '@id'
            },
            {
                'update': { method:'PUT' }
            }
        );
    }])

    .factory('SettingsService', ['$resource', ($resource) => {
        return $resource(
            config.getApiUrl() + 'settings/:type/:field',
            {
                type: '@type',
                field: '@field'
            },
            {
                'update': { method:'PUT' }
            }
        );
    }])

    .factory('ReportsService', ['$resource', ($resource) => {
        return $resource(
            config.getApiUrl() + 'reports'
        );
    }])

    .service('Projects', Projects)

    .service('SettingsUser', SettingsUser)
    .service('ProjectsModal', ProjectsModal)
    .service('AuthToken',  AuthToken);
