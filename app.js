var express = require("express");
var jade = require("jade");
var path = require("path");
var http = require("http");
var data = require("./data");
var dateFormat = require("dateformat");
var utils = require("./utils");
var fs = require("fs");

function add(request, response) {
        fs.readFile(request.files.image.path, function(err, image) {
                data.add(request.body.name, request.body.expires, image, function() {
                        // console.log(image);
                        fridge(request, response);
                });
        });
}

function list(request, response) {
        response.render('list.jade');
}

function fridge(request, response) {
        data.all(function(err, rows) {
                response.render('fridge.jade', {
                        rows: rows,
                        reparse: utils.reparse
                });
        });
}

function del(request, response) {
        data.del(request.params.name, function() {
                fridge(request, response);
        });
}

function img(request, response) {
        data.img(request.params.name, function(err, rows) {
                rows && console.log(rows);
                rows && response.set('Content-Type', 'image/jpeg');
                rows && response.send(rows.image);
                // NO response.end() here!!
        });
}

var app = express();

app.configure(function() {
        app.set('port', process.env.PORT || 8888);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use(express.bodyParser());
        app.use(express.cookieParser('segretissimo'));
        app.use(express.session());
        //        app.use(express.methodOverride());
        //        app.use(app.router);
        app.use(express.favicon(path.join(__dirname, '/public/images/favicon.ico')));
        app.use(express.static(path.join(__dirname, 'public')));
        app.use(express.errorHandler());

        app.get('/', list);
        app.get('/list', list);
        app.get('/fridge', fridge);
        app.post('/add', add);
        app.get('/del/:name', del);
        app.get('/img/:name', img);
});

app.configure('development', function() {
        app.use(express.logger('dev'));
        app.set('db_url', ':memory:');
});

data.init(app.get('db_url'), function() {
        data.populate();
});

http.createServer(app).listen(app.get('port'), function() {
        console.log("ExpiredJS is listening on port " + app.get('port') + " (with express).")
});
