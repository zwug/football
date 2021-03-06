/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes');


var pgOld = require("pg");

var pg = require('knex')({
    client: 'pg',
    connection: "postgresql://zwug:123@localhost:5432/football",
    "timezone": "Europe/Moscow"
});

var conString = "postgresql://zwug:123@localhost:5432/football";

client = new pgOld.Client(conString);

client.connect(function (err) {
    if (err) {
        return console.error('could not connect to postgres', err);
    }
});

var app = module.exports = express.createServer();

// Configuration

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.register('.html', require('ejs'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.static(__dirname + '/node_modules'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes

app.get('/add_match', function (req, res) {
    res.render('index.ejs');
});

app.get('/', function (req, res) {
    res.render('home.ejs');
});

app.get('/goals', function (req, res) {

    var query = client.query("select * from (SELECT    player.first_name, player.last_name, player.country,       " +
        " count(goals.id) AS goals_total  " +
        "  FROM (individual    " +
        "left JOIN (SELECT * from goals WHERE is_own = FALSE )as goals   " +
        " ON individual.id = goals.individual_id) right JOIN player ON player_id = player.id" +
        "    GROUP BY player.id ORDER BY goals_total DESC)as result WHERE goals_total > 0");

    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        console.log(result.rows);
        res.render('goals.ejs',
            {goalsArr: result.rows }
        );
    });
});

app.get('/ftable', function (req, res) {
    var teamsArr = [];
    var query = client.query("Select * from (select table1.tournament as competition, table1.date as date, table1.host_win as host_win, " +
        " table1.name as host, table2.name as guest from " +
        "(SELECT * FROM match LEFT JOIN football_club on match.host_team_id = football_club.club_id) as table1" +
        " inner join " +
        "(SELECT * FROM match LEFT JOIN football_club on match.guest_team_id = football_club.club_id) as table2" +
        " on table1.id = table2.id)as result where competition = 'BBVA La Liga'");
    query.on("row", function (row, result) {
        result.addRow(row);

        if (!teamsArr[row.host]) {
            teamsArr[row.host] = 0;
        }
        if (!teamsArr[row.guest]) {
            teamsArr[row.guest] = 0;
        }

        if (row.host_win === 'yes') {
            teamsArr[row.host] += 3;
        }
        else if (row.host_win === 'no ') {
            teamsArr[row.guest] += 3;
        }
        else {
            teamsArr[row.host] += 1;
            teamsArr[row.guest] += 1;
        }
    });
    query.on("end", function (result) {
        var sortable = [];
        for (var vehicle in teamsArr)
            sortable.push([vehicle, teamsArr[vehicle]])
        sortable.sort(function (a, b) {
            return b[1] - a[1]
        });

        res.render('table.ejs',
            {goalsArr: sortable
            });
    });
});


function getData(req, res) {
    var query = client.query("SELECT * from " + req.params.entity);
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.json({
            result: result.rows
        });
    });
};

function getDataParams(req, res) {
    var query = client.query("SELECT * from " + req.params.entity + " WHERE " + req.params.col + " = " + req.params.param);
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.json({
            result: result.rows
        });
    });
};

function playersIn(req, res) {
    var query = client.query("(SELECT * from player LEFT JOIN football_club ON " +
        "player.football_club_id = football_club.club_id WHERE football_club.name = " + "'" + req.params.name + "')" +
        "UNION" +
        "(SELECT * from player LEFT JOIN football_club ON " +
        "player.national_team_id = football_club.club_id WHERE football_club.name = " + "'" + req.params.name + "')");
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.json({
            result: result.rows
        });
    });
};

function addMatch(req, res) {
    console.log('===================addMatch====================');
    var insertRecords = function (matchId, isHost, arrData) {
        arrData.forEach(function (elementHosts) {
            return pg('individual')
                .returning('id')
                .insert({player_id: elementHosts.id, match_id: matchId[0], rating: elementHosts.rating,
                    red_cards: elementHosts.red_cards, yellow_cards: elementHosts.yellow_cards,
                    in_host_team: isHost
                }).catch(function (error) {
                    console.error(error);
                }).then(function (individualId) {
                    elementHosts.goals.forEach(function (goal) {
                        return pg('goals')
                            .insert({minute: goal.minute, is_penalty: goal.isPenalty,
                                is_own: goal.isOwn, individual_id: individualId[0]
                            }).catch(function (error) {
                                console.error(error);
                            })
                    })
                })
        })
    }

    pg('match')
        .returning('id')
        .insert({
            date: req.body.matchDate.toString(),
            guest_team_id: req.body.teamGuest.club_id, host_team_id: req.body.teamHost.club_id,
            tournament: req.body.tournament, host_win: req.body.hostWin
        })
        .then(function (matchId) {
            insertRecords(matchId, true, req.body.hostPlayers);
            return matchId
        })
        .then(function (matchId) {
            insertRecords(matchId, false, req.body.guestPlayers);
        }).then(function () {
            var query = client.query("update goals set is_penalty =  FALSE where is_penalty = FALSE");
        })
};

app.get('/api/:entity', getData);
app.get('/api/:entity/:col/:param', getDataParams);
app.get('/api/players_in/:name', playersIn);
app.post('/api/add_match', addMatch);

app.listen(3000, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
