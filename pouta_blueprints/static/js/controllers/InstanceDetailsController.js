app.controller('InstanceDetailsController', ['$q', '$http', '$routeParams', '$scope', '$interval', 'AuthService', 'Restangular',
                                    function ($q,   $http,   $routeParams,   $scope,   $interval,   AuthService,   Restangular) {

        Restangular.setDefaultHeaders({token: AuthService.getToken()});

        var instance_id = $routeParams.instance_id;
        var instance;

        $scope.refresh = function () {
            Restangular.one('instances', instance_id).get().then(function (response) {
                instance = response;
                $scope.instance = response;
            }).then(function () {
                Restangular.one('blueprints', instance.blueprint_id).get().then(function (response) {
                    $scope.blueprint = response;
                });
            }).then(function () {
                $scope.fetchLogs(instance);
            });
        };
        $scope.refresh();

        $scope.fetchLogs = function (instance) {
            if (!instance.logs.length) {
                Restangular.one('instances', instance.id).get().then(function (response) {
                    instance = response;
                    $scope.instance = instance;
                });
            }
            angular.forEach(instance.logs, function (log) {
                $http(
                    {
                        method: "GET",
                        url: log.url,
                        log_type: log.type,
                        headers: {
                            token: AuthService.getToken(),
                            Authorization: "Basic " + AuthService.getToken()
                        }
                    }
                ).success(function (data, status, headers, config) {
                        var log_type = config.log_type;
                        if (!$scope.logs) {
                            $scope.logs = {};
                        }
                        $scope.logs[log_type] = data;
                    }
                );
            });
        };

        var stop;
        $scope.startPolling = function() {
            if (angular.isDefined(stop)) {
                return;
            }
            stop = $interval(function () {
                if (AuthService.isAuthenticated()) {
                    $scope.refresh();
                } else {
                    $interval.cancel(statePollInterval);
                }
            }, 10000);
        };

        $scope.stopPolling = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.$on('$destroy', function() {
            $scope.stopPolling();
        });

        $scope.startPolling();
    }
])
;
