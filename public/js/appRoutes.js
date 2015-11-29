export default {

    '/login': {
        templateUrl: 'public/views/login.html',
        controller: 'LoginController',
        requireLogin: false
    },
    '/logout': {
        templateUrl: 'public/views/logout.html',
        controller: 'LogoutController',
        requireLogin: true
    },

    '/projects/client/:id': {
        templateUrl: 'public/views/projects-list.html',
        controller: 'ProjectsListController',
        requireLogin: true
    },
    '/projects': {
        templateUrl: 'public/views/projects-list.html',
        controller: 'ProjectsListController',
        requireLogin: true
    },
    '/projects/new': {
        templateUrl: 'public/views/project-form.html',
        controller: 'ProjectsNewController',
        requireLogin: true
    },
    '/projects/:id': {
        templateUrl: 'public/views/project.html',
        controller: 'ProjectsViewController',
        requireLogin: true
    },
    '/projects/:id/edit': {
        templateUrl: 'public/views/project-form.html',
        controller: 'ProjectsEditController',
        requireLogin: true
    },

    '/clients': {
        templateUrl: 'public/views/clients-list.html',
        controller: 'ClientsListController',
        requireLogin: true
    },

    '/reports': {
        templateUrl: 'public/views/reports.html',
        controller: 'ReportsController',
        requireLogin: true
    },

    '/settings': {
        templateUrl: 'public/views/settings.html',
        controller: 'SettingsController',
        requireLogin: true
    },

    '/status': {
        templateUrl: 'public/views/status.html',
        controller: 'StatusController',
        requireLogin: false
    }
};
