/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes');


var pg = require("pg");

var conString = "postgresql://zwug:123@localhost:5432/football";

var client = new pg.Client(conString);
client.connect(function (err) {
    if (err) {
        return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * from player', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }
        console.log(result.rows[0]);
        //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
        //client.end();
    });
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
    
    console.log(req.body);

    var query = client.query("INSERT INTO match(date,guest_team_id,host_team_id,tournament, host_win) " +
        "VALUES ('" + req.body.matchDate + "', '" + req.body.teamGuest.club_id + "', '" +
        req.body.teamHost.club_id + "', '" + req.body.tournament + "', '" + req.body.hostWin + "')");

    var match_id = 0;

    query = client.query("select id from match where date = '" + req.body.matchDate + "' and guest_team_id = "
        + req.body.teamGuest.club_id + " and host_team_id = " + req.body.teamHost.club_id);

    query.on("row", function (row, result) {
        result.addRow(row);
    });

    query.on("end",function (result) {
        match_id = result.rows[0].id;
        console.log(match_id);

        req.body.hostPlayers.forEach(function (element, index, array) {
            query = client.query("INSERT INTO individual(player_id, match_id, rating, red_cards, yellow_cards," +
                " in_host_team) VALUES ('" + element.id + "', '" + match_id + "', '" +
                element.rating + "', '" + element.red_cards + "', '" + element.yellow_cards + "', " + true + ")");
        })

        req.body.guestPlayers.forEach(function (element, index, array) {
            query = client.query("INSERT INTO individual(player_id, match_id, rating, red_cards, yellow_cards," +
                " in_host_team) VALUES ('" + element.id + "', '" + match_id + "', '" +
                element.rating + "', '" + element.red_cards + "', '" + element.yellow_cards + "', " + false + ")");
        })
    })

    res.end();

};

app.get('/api/:entity', getData);
app.get('/api/:entity/:col/:param', getDataParams);
app.get('/api/players_in/:name', playersIn);
app.post('/api/add_match', addMatch);

app.listen(3000, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
