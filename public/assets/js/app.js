(function() {
    'use strict';

    var app = angular.module('tmp', []);

    app.controller('ProjectsController', function() {
        this.projectsList = [
            {
                projectName: '10 Negri Mititei',
                clientName: 'Lia draguta'
            },
            {
                projectName: 'Mutulica mititica',
                clientName: 'Un client simpatic'
            }
        ];
    });

}());