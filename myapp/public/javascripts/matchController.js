/**
 * Created by zwug on 12/21/14.
 */

function matchController($http, $scope, $filter) {

    this.scoreHost = 0;
    this.scoreGuest = 0;
    $scope.yellow_cards = [0, 1, 2];
    $scope.red_cards = [0, 1];

    this.getData = function () {
        $http.get('/api/match/').
            success(function (data) {
                $scope.tournament = ['UEFA Champions League'];
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
                        element.rating = 6.5;
                        element.yellow_cards = 0;
                        element.red_cards = 0;

                    })

                    if (isHost) {
                        $scope.HostPlayers = data.result;
                        console.log($scope.HostPlayers);
                    } else {
                        $scope.GuestPlayers = data.result;
                    }
                });
        }
    }

    this.addGoal = function (goalsArr, isHost) {
        var goal = {};
        goal.minute = 45;
        goal.isOwn = false;
        goal.isPenalty = false;
        if (isHost) {
            this.scoreHost++;
        }
        else {
            this.scoreGuest++;
        }
        goalsArr.push(goal);
    }

    this.updateGoals = function (isOwn, isHost) {
        if (isOwn && isHost || !isOwn && !isHost) {
            this.scoreHost--;
            this.scoreGuest++;
        }
        else {
            this.scoreHost++;
            this.scoreGuest--;
        }
    }

    this.submit = function () {
        // if (this.selectedTournament && this.date && this.host && this.guest) {
        var hostWin = "no";
        if (this.scoreGuest < this.scoreHost) {
            hostWin = "yes";
        }
        else if (this.scoreGuest == this.scoreHost) {
            hostWin = "tie";
        }
        var matchParams = {
            tournament: this.selectedTournament,
            matchDate: $filter('date')(this.date, 'yyyy-MM-dd'),
            teamHost: this.host,
            teamGuest: this.guest,
            hostWin: hostWin,
            guestPlayers: $scope.GuestPlayers,
            hostPlayers: $scope.HostPlayers
        }
        $http.post('/api/add_match', matchParams).success(function () {
            console.log("success");
        });
        //}
    }

    this.getTeams();
    this.getData();
}

angApp.controller('matchController', matchController);
