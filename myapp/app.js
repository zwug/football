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
    var query = client.query("SELECT * from match");
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        console.log(JSON.stringify(result.rows, null, "    "));
        res.render('index.ejs', {conString: result.rows[0].id});
    });

});

app.get('/page', function (req, res) {
    res.render('index',
        title = "loh"
    );
});

app.listen(3000, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});