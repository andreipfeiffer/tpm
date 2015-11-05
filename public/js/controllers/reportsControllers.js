(function() {

    'use strict';

    angular.module('TPM.ReportsControllers', [])

        .controller('ReportsController', [
            '$scope',
            '$modal',
            '$http',
            'feedback',
            'ReportsService',
            function($scope, $modal, $http, feedback, Reports) {

                $scope.isLoading = true;
                $scope.projects  = [];
                $scope.chart     = {
                    data  : [
                        [0]
                    ],
                    series: [],
                    labels: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']
                };

                feedback.load();

                Reports.query().$promise.then(function(data) {

                    $scope.projects          = groupByMonth( data );
                    $scope.clientsByProjects = groupByClient( data ).sort( sortClientsByProjects );
                    $scope.clientsByPrice    = groupByClient( data ).sort( sortClientsByPrice );
                    $scope.notPaid           = getNotPaid( data );
                    $scope.isLoading         = false;

                    $scope.chart = getChartData( $scope.projects );

                    feedback.dismiss();
                });

                var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
                    $scope.data  = angular.extend({}, data.list);
                    $scope.title = data.title;
                };

                $scope.showProjects = function(title, list) {

                    var modalInstance = $modal.open({
                        templateUrl: 'views/reports-show-projects.html',
                        controller : ModalInstanceCtrl,
                        resolve    : {
                            data : function() {
                                return {
                                    list : list,
                                    title: title
                                };
                            }
                        }
                    });

                    return modalInstance;
                };

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

                        if ( project.status === 'paid' ) {
                            month['price'] += getPrice( project );
                            month.projects.push( project );
                        }
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
                    if (price1 > price2) { return -1; }
                    if (price1 < price2) { return 1; }
                    return 0;
                }

                function sortClientsByProjects(c1, c2) {
                    var projects1 = parseInt( c1.projects.length );
                    var projects2 = parseInt( c2.projects.length );
                    if (projects1 > projects2) { return -1; }
                    if (projects1 < projects2) { return 1; }
                    return 0;
                }

                function getChartData(months) {
                    var _months = angular.extend([], months);
                    var res = {
                        data  : [],
                        series: []
                    };

                    _months.reverse().forEach(function(month) {
                        var year = month.monthRaw.slice(0, 4);

                        if ( res.series.indexOf(year) === -1 ) {
                            res.series.push( year );
                            res.data.push([]);
                        }

                        res.data[ res.series.length - 1 ].push( month.price );
                        // res.labels.push( month.month );
                    });

                    // if first "year" didn't start at January, fill with empty data
                    for (var i = (12 - res.data[0].length); i > 0; i -= 1) {
                        res.data[0].unshift( 0 );
                    }

                    // reverse data, so the current year is first
                    res.data.reverse();
                    res.series.reverse();

                    return res;
                }
            }
        ]);

}());
