var express = require("express");
var jade = require("jade");
var path = require("path");
var http = require("http");
var sqlite3 = require("sqlite3").verbose();
var dateFormat = require("dateformat");
var url = require("url");
var querystring = require("querystring");

function add(request, response) {
        var name = request.param('name', null);
        var expires = request.param('expires', null);
        db.prepare('insert into items values(?, ?)').run(name, expires, function() {
                response.end();
        });
}

function list(request, response) {
        response.render('list.jade');
}

function fridge(request, response) {
        db.all('select * from items order by expires desc', function(err, rows) {
                response.render('fridge.jade', {
                        rows: rows,
                        dateFormat: dateFormat
                });
        });
}

function del(request, response) {
        var name = querystring.parse(url.parse(request.url).query)['n'];
        console.log(name);
        db.prepare('delete from items where name=?').run(name, function() {
                response.writeHead(302, {
                        Location: "/list"
                });
                response.end();
        });
}

var app = express();

app.configure(function() {
        app.set('port', process.env.PORT || 8888);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use(express.favicon(path.join(__dirname, '/public/images/favicon.ico')));
        app.use(express.cookieParser('segretissimo'));
        app.use(express.session());
        app.use(express.bodyParser());
        app.use(express.errorHandler());
        //        app.use(express.methodOverride());
        //        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
        app.use(express.logger('dev'));
        app.set('db_url', ':memory:');
});

// Database initialization
var db = new sqlite3.Database(app.get('db_url'));
app.configure('development', function() {
        db.run('create table items (name text, expires datetime)', function() {
                var st = db.prepare("insert into items values(?,?)", function() {
                        for(var i = 10; i >= 0; i--) {
                                var date = new Date();
                                date.setMonth(i);
                                st.run("Item " + i, date);
                        }
                });
        });
});

app.get('/', list);
app.get('/list', list);
app.get('/fridge', fridge);
app.post('/add', add);
app.get('/del', del);

http.createServer(app).listen(app.get('port'), function() {
        console.log("ExpiredJS is listening on port " + app.get('port') + " (with express).")
});
