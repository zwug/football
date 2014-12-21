/**
 * Created by zwug on 12/21/14.
 */

function matchController($http, $scope) {
    this.temp = "angular";
    console.log(this.temp);
    this.getData = function () {
        $http.get('/api/match/').
            success(function (data) {
                $scope.tournament = [];
                data.result.forEach(function (element, index, array) {
                    if ($scope.tournament.indexOf(element.tournament) == -1) {
                        $scope.tournament[index] = element.tournament;
                    }
                })
            });
    }

    this.getTeams = function () {
        $http.get('/api/football_club/').
            success(function (data) {
                $scope.teams = data.result;
                console.log($scope.teams);
            });
    }

    this.getPlayers = function (name) {
        if (name != "") {
            $http.get('/api/player/name').
                success(function (data) {
                    $scope.teams = data.result;
                    console.log($scope.teams);
                });
        }
    }

    this.getTeams();
    this.getData();
}

angApp.controller('matchController', matchController);
