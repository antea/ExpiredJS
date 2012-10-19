var express = require("express");
var jade = require("jade");
var path = require("path");
var http = require("http");
var data = require("./data-sqlite3");
var dateFormat = require("dateformat");
var utils = require("./utils");
var fs = require("fs");
var im = require("imagemagick");
var cron = require('cron').CronJob;
var nodemailer = require("nodemailer");

function add(request, response) {
        var imagename = request.body.name;
        var expires = request.body.expires;
        if(request.files.image) {
                var imagepath = request.files.image.path;
                im.convert([imagepath, '-resize', '40x40', imagepath + 's'], function(err, stdout) {
                        fs.readFile(imagepath, function(err, image) {
                                fs.readFile(imagepath + 's', function(err2, thumbnail) {
                                        data.add(imagename, expires, image, thumbnail, function() {
                                                fridge(request, response);
                                        });
                                });
                        });
                });
        } else {
                data.add(imagename, expires, null, null, function() {
                        fridge(request, response);
                });
        }
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

function sendImageOrBlank(image, response) {
        if(image) {
                response.send(image);
        } else {
                fs.readFile('public/images/empty.png', function(err, image) {
                        response.send(image);
                });
        }
}

function img(request, response) {
        data.img(request.params.name, function(err, rows) {
                sendImageOrBlank(rows.image, response);
        });
}

function thumb(request, response) {
        data.thumbnail(request.params.name, function(err, rows) {
                sendImageOrBlank(rows.thumbnail, response);
        });
}

var app = express();
var conf;
var smtp;

fs.readFile('expiredjs.conf', 'utf8', function(err, confdata) {
        conf = JSON.parse(confdata);
        smtp = nodemailer.createTransport("SMTP", {
                service: "Gmail",
                auth: {
                        user: conf.mailsender,
                        pass: conf.mailpassword
                }
        });

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
                app.get('/thumb/:name', thumb);
        });

        app.configure('development', function() {
                app.use(express.logger('dev'));
                app.set('db_url', ':memory:');
        });

        data.init(app.get('db_url'), function() {
                data.populate();
        });

        http.createServer(app).listen(app.get('port'), function() {
                console.log("ExpiredJS is listening on port " + app.get('port') + " (with express).");
        });

        new cron(conf.cron, function() {
                data.nextdays(conf.notice, function(err, rows) {
                        if(rows) {
                                var message = 'The following things are expiring in the next ' + conf.notice + ' days:\n';
                                rows.forEach(function(row) {
                                        message += row.name + ": " + utils.reparse(row.expires) + '\n';
                                });
                                console.log(message);
                                var mailOptions = {
                                        from: conf.mailsender,
                                        to: conf.mailrecipient,
                                        subject: "ExpiredJS has something for you",
                                        text: message
                                }
                                smtp.sendMail(mailOptions, function(error, response) {
                                        if(error) {
                                                console.log(error);
                                        } else {
                                                console.log("Message sent: " + response.message);
                                        }
                                        smtp.close(); // shut down the connection pool, no more messages
                                });
                        }
                });
        }, null, true);
});
