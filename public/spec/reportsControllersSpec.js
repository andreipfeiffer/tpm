(function() {

    'use strict';

    describe('Reports Controllers', function() {

        beforeEach(module('tpm'));

        describe('ReportsController', function() {
            var scope, ctrl, $httpBackend;

            beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
                $httpBackend = _$httpBackend_;
                $httpBackend.expectGET(TPM.apiUrl + 'reports').respond( TPM.mocks.reports );
                $httpBackend.whenGET(/views\//).respond(200);

                scope = $rootScope.$new();
                ctrl  = $controller('ReportsController', {$scope: scope});

                jasmine.addMatchers( TPM.customMatchers );
            }));


            it('should set the response from the API to $scope.projects', function() {
                expect( scope.projects ).toEqualDeep( [] );
                $httpBackend.flush();

                expect( scope.projects ).toEqualDeep( TPM.mocks.reports );
            });

            it('should calculate "projects finished, not paid"', function() {
                $httpBackend.flush();

                expect( scope.notPaid ).toEqual( 320 );
            });

            it('should set data for the monthly income table', function() {
                $httpBackend.flush();

                expect( scope.months.length ).toEqual( 2 );
                expect( scope.months[0].month ).toEqual('January 2015');
                expect( scope.months[1].month ).toEqual('December 2014');
            });

            it('should set data for the monthly income chart', function() {
                $httpBackend.flush();

                expect( scope.chartMonth.series ).toEqualDeep( ['2015', '2014'] );

                // 2015 total
                expect( scope.chartMonth.data[0] ).toEqualDeep( [300] );

                // 2014 total
                expect( scope.chartMonth.data[1].length ).toEqual( 12 );
                // empty months filled with null
                expect( scope.chartMonth.data[1][0] ).toBeNull();
                expect( scope.chartMonth.data[1][10] ).toBeNull();
                // last month has data
                expect( scope.chartMonth.data[1][11] ).toEqual( 2700 );
            });

            it('should set data for the price evolution chart', function() {
                $httpBackend.flush();

                expect( scope.chartPrice.data ).toEqualDeep( [1, 2, 1] );
            });

            it('should set data for "income by client"', function() {
                $httpBackend.flush();

                expect( scope.clientsByPrice[0].name ).toEqual('client B');
                expect( scope.clientsByPrice[0].price ).toEqual( 2500 );
            });

            it('should set data for "projects by client"', function() {
                $httpBackend.flush();

                expect( scope.clientsByProjects[0].name ).toEqual('client A');
                expect( scope.clientsByProjects[0].projects.length ).toEqual( 3 );
            });

        });
    });

})();
