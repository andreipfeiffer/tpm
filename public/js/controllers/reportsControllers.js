(function() {

    'use strict';

    angular.module('TPM.ReportsControllers', [])

        .controller('ReportsController', [
            '$scope',
            '$uibModal',
            '$http',
            '$location',
            'feedback',
            'tpmCache',
            'ReportsService',
            'SettingsUser',
            'ProjectsModal',
            function($scope, $modal, $http, $location, feedback, tpmCache, Reports, SettingsUser, ProjectsModal) {

                $scope.currency   = SettingsUser.get().currency;
                $scope.isLoading  = true;
                $scope.projects   = [];
                $scope.chartMonth = {
                    data  : [
                        [0]
                    ],
                    series: [],
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                };

                feedback.load();

                Reports.query().$promise.then(function(data) {

                    $scope.projects          = data;
                    $scope.clientsByProjects = groupByClient( data ).sort( sortClientsByProjects );
                    $scope.clientsByPrice    = groupByClient( data ).sort( sortClientsByPrice );
                    $scope.notPaid           = getNotPaid( data );
                    $scope.isLoading         = false;

                    // setup chart data for month report
                    $scope.months            = groupByMonth( data );
                    var chartMonthsData      = getMonthsChartData( $scope.months );
                    $scope.chartMonth.data   = chartMonthsData.data;
                    $scope.chartMonth.series = chartMonthsData.series;

                    $scope.chartPrice        = getPriceChartData( data );

                    feedback.dismiss();
                });

                $scope.gotoFinishedProjects = function() {
                    tpmCache.put('filterStatus', 'finished');
                    $location.path('/projects');
                };

                $scope.showProjects = function(title, list, detailedPrice) {
                    ProjectsModal.open( title, list, detailedPrice );
                };

                $scope.showProjectsByPriceChange = function(point) {
                    var data = point[0],
                        priceChange, projectsList, detailedPrice;

                    if ( !data ) { return; }

                    var labelIndex = $scope.chartPrice.labels.indexOf( data.label );
                    if ( labelIndex > -1 ) {
                        // magic number here
                        // the labels are set in the same order
                        // as the type param of the getProjectsByPriceChange()
                        // all we need is to extract 1, so we get to -1, 0, 1
                        // instead of 0, 1, 2
                        priceChange   = labelIndex - 1;
                        projectsList  = getProjectsByPriceChange( priceChange );
                        detailedPrice = (priceChange === 0) ? false : true;

                        $scope.showProjects(
                            'Projects with ' + data.label.toLowerCase(),
                            projectsList,
                            detailedPrice
                        );
                    }
                };

                function getFirstMonth(projects) {
                    // @todo get first & last with status "paid"
                    var res = projects[projects.length - 1].month.split('-').map( TPM.utils.toInt );
                    return {
                        year : res[0],
                        month: res[1]
                    };
                }

                function getLastMonth(projects) {
                    // @todo get first & last with status "paid"
                    var res = projects[0].month.split('-').map( TPM.utils.toInt );
                    return {
                        year : res[0],
                        month: res[1]
                    };
                }

                function getPaidProjectsByMonth(projects, year, month) {
                    return projects.filter(function(project) {
                        return (
                            project.month  === (year + '-' + month) &&
                            project.status === 'paid'
                        );
                    });
                }

                function getTotalPrice(projects) {
                    return projects.reduce(function(price, project) {
                        return price + getPrice( project );
                    }, 0);
                }

                function groupByMonth(projectsList) {
                    var projects = getProjectsByStatus( projectsList, 'paid' ),
                        res = [],
                        first = getFirstMonth( projects ),
                        last  = getLastMonth( projects ),
                        y, m;

                    for ( y = first.year; y <= last.year; y += 1 ) {
                        for ( m = 1; m <= 12; m += 1 ) {

                            if ( y === last.year && m > last.month ) {
                                break;
                            }

                            if ( y === first.year && m < first.month ) {
                                // console.log('null');
                            } else {
                                // get projects
                                // console.log( y + '-' + m );

                                var monthProjects = getPaidProjectsByMonth( projects, y, m );
                                var total = getTotalPrice( monthProjects );

                                res.push({
                                    price   : total,
                                    month   : moment(y + '-' + m + '-01', 'YYYY-MM-DD').format('MMMM YYYY'),
                                    monthRaw: y + '-' + m,
                                    projects: monthProjects
                                });
                            }
                        }
                    }

                    return res.reverse();
                }

                function groupByClient(projects) {
                    var res = [];

                    projects.forEach(function(project) {
                        var client = getCurrentClient(res, project.idClient);

                        if ( project.status !== 'paid' ) {
                            return;
                        }

                        if ( !client ) {
                            res.push({
                                price   : 0,
                                id      : project.idClient,
                                name    : getClientName( project ),
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
                    var val = 0,
                        nr  = 0;
                    projects.forEach(function(project) {
                        if ( project.status === 'finished' ) {
                            val += getPrice(project);
                            nr  += 1;
                        }
                    });
                    return {
                        value: val,
                        nr   : nr
                    };
                }

                function getPrice(project) {
                    if ( project.priceFinal ) {
                        return project.priceFinal;
                    }
                    return project.priceEstimated;
                }

                function getClientName(project) {
                    return project.clientName || 'No Client';
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

                function sortProjectsByDate(p1, p2) {
                    var date1 = parseInt( p1.date );
                    var date2 = parseInt( p2.date );
                    if (date1 > date2) { return -1; }
                    if (date1 < date2) { return 1; }
                    return 0;
                }

                function getProjectsByStatus(projects, status) {
                    return projects.filter(function(project) {
                        return project.status === status;
                    });
                }

                function getMonthsChartData(months) {
                    var res = {
                        data  : [],
                        series: []
                    };

                    if ( !months.length ) {
                        return res;
                    }

                    var _months = angular.extend([], months);

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
                        res.data[0].unshift( null );
                    }

                    // reverse data, so the current year is first
                    res.data.reverse();
                    res.series.reverse();

                    return res;
                }

                function getPriceChartData() {
                    var data = [],
                        priceLowered    = getProjectsByPriceChange( -1 ).length,
                        priceNotChanged = getProjectsByPriceChange( 0 ).length,
                        priceRaised     = getProjectsByPriceChange( 1 ).length;

                    // populate data only if we have some data
                    if ( priceLowered || priceNotChanged || priceRaised ) {
                        data = [priceLowered, priceNotChanged, priceRaised];
                    }

                    return {
                        data  : data,
                        labels: ['Price lowered', 'Price not changed', 'Price raised']
                    };
                }

                function getProjectsByPriceChange(type) {
                    // type = -1; // price was lowered
                    // type =  1; // price was raised
                    // type =  0; // price was not changed

                    return $scope.projects.filter(function(project) {
                        var priceEstimated = parseInt( project.priceEstimated ),
                            priceFinal     = parseInt( project.priceFinal );

                        if ( project.status !== 'paid' ) {
                            return false;
                        }

                        if ( type === 0 ) {
                            return ( priceEstimated === priceFinal || priceFinal === 0 || priceEstimated === 0 );
                        }
                        if ( type === 1 ) {
                            return ( priceEstimated < priceFinal && priceEstimated > 0 );
                        }
                        if ( type === -1 ) {
                            return ( priceEstimated > priceFinal && priceFinal > 0 );
                        }
                    });
                }

            }
        ]);

}());
