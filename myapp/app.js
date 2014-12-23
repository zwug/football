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

app.get('/', function (req, res) {
    res.render('index.ejs');
});

app.get('/page', function (req, res, angApp) {
    console.log(angApp);
    res.render('index.ejs',
        {conString: "Hi there"}
    );

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
    var query = client.query("SELECT * from player LEFT JOIN football_club ON " +
        "player.football_club_id = football_club.club_id WHERE football_club.name = " + "'" + req.params.name + "'");
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
    pg('match')
        .returning('id')
        .insert({
            date: req.body.matchDate.toString(),
            guest_team_id: req.body.teamGuest.club_id, host_team_id: req.body.teamHost.club_id,
            tournament: req.body.tournament, host_win: req.body.hostWin
        }).then(function (matchId) {
            req.body.hostPlayers.forEach(function (elementHosts) {
                console.log(matchId[0]);
                return pg('individual')
                    .returning('id')
                    .insert({player_id: elementHosts.id, match_id: matchId[0], rating: elementHosts.rating,
                        red_cards: elementHosts.red_cards, yellow_cards: elementHosts.yellow_cards,
                        in_host_team: true
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
        }).then(function () {
            console.log('1');
        })

//same for guest team and look at triggers


    res.end();

}
;

app.get('/api/:entity', getData);
app.get('/api/:entity/:col/:param', getDataParams);
app.get('/api/players_in/:name', playersIn);
app.post('/api/add_match', addMatch);

app.listen(3000, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
