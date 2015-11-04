(function() {

    'use strict';

    angular.module('TPM.ReportsControllers', [])

        .controller('ReportsController', [
            '$scope',
            '$http',
            'feedback',
            'ReportsService',
            function($scope, $http, feedback, Reports) {

                $scope.isLoading = true;
                $scope.projects  = [];

                feedback.load();

                Reports.query().$promise.then(function(data) {

                    console.log( data );

                    $scope.projects          = groupByMonth( data );
                    $scope.clientsByProjects = groupByClient( data ).sort( sortClientsByProjects );
                    $scope.clientsByPrice    = groupByClient( data ).sort( sortClientsByPrice );
                    $scope.notPaid           = getNotPaid( data );
                    $scope.isLoading         = false;

                    feedback.dismiss();
                });

                function groupByMonth(projects) {
                    var res = [];

                    projects.forEach(function(project) {
                        var month = getCurrentMonth(res, project.month);

                        if ( !month ) {
                            res.push({
                                price   : 0,
                                month   : moment(project.month + '-01').format('MMMM YYYY'),
                                monthRaw: project.month,
                                projects: []
                            });

                            month = res[res.length - 1];
                        }

                        month['price'] += getPrice( project );
                        month.projects.push( project );
                    });

                    return res;
                }

                function groupByClient(projects) {
                    var res = [];

                    projects.forEach(function(project) {
                        var client = getCurrentClient(res, project.idClient);

                        if ( !client ) {
                            res.push({
                                price   : 0,
                                id      : project.idClient,
                                name    : project.clientName,
                                projects: []
                            });

                            client = res[res.length - 1];
                        }

                        client['price'] += getPrice( project );
                        client.projects.push( project );
                    });

                    return res;
                }

                function getNotPaid(projects) {
                    var val = 0;
                    projects.forEach(function(project) {
                        if ( project.status !== 'paid' ) {
                            val += getPrice(project);
                        }
                    });
                    return val;
                }

                function getPrice(project) {
                    if ( project.priceFinal ) {
                        return project.priceFinal;
                    }
                    return project.priceEstimated;
                }

                function getCurrentMonth(res, month) {
                    return res.filter(function(project) {
                        return project.monthRaw === month;
                    })[0];
                }

                function getCurrentClient(res, idClient) {
                    return res.filter(function(project) {
                        return project.id === idClient;
                    })[0];
                }

                function sortClientsByPrice(c1, c2) {
                    var price1 = parseInt( c1.price );
                    var price2 = parseInt( c2.price );
                    if (price1 > price2) return -1;
                    if (price1 < price2) return 1;
                    return 0;
                }

                function sortClientsByProjects(c1, c2) {
                    var projects1 = parseInt( c1.projects.length );
                    var projects2 = parseInt( c2.projects.length );
                    if (projects1 > projects2) return -1;
                    if (projects1 < projects2) return 1;
                    return 0;
                }
            }
        ]);

}());
