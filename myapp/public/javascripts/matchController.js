/**
 * Created by zwug on 12/21/14.
 */

function matchController($http, $scope) {

    this.scoreHost = 0;
    this.scoreGuest = 0;
    $scope.yellow_cards = [0, 1, 2];
    $scope.red_cards = [0, 1];
    this.player = {};
    this.player.rating = 6.5;
    this.player.yellow_cards = 0;
    this.player.red_cards = 0;

    console.log($scope.yellow_cards);

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
            });
    }

    this.getPlayers = function (name, isHost) {
        if (name != "") {
            $http.get('/api/players_in/' + name).
                success(function (data) {
                    data.result.forEach(function (element, index, array) {
                        element.goals = [];
                    })

                    if (isHost) {
                        $scope.HostPlayers = data.result;
                    }else{
                        $scope.GuestPlayers = data.result;
                    }
                });
        }
    }

    this.addGoal = function(goalsArr, isHost){
        var goal = {};
        goal.minute = 45;
        goal.isOwn = false;
        if(isHost){
            this.scoreHost++;
        }
        else{
            this.scoreGuest++;
        }
        goalsArr.push(goal);
    }

    this.updateGoals = function(isOwn, isHost){
            if(isOwn){
                this.scoreHost--;
                this.scoreGuest++;
            }
            else{
                this.scoreHost++;
                this.scoreGuest--;
            }
    }

    this.getTeams();
    this.getData();
}

angApp.controller('matchController', matchController);
