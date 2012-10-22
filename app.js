var configure = require("./lib/conf").conf;

configure(function(conf) {
        var fs = require("fs");
        var path = require("path");
        var express = require("express");
        var jade = require("jade");
        var http = require("http");
        var data = require("./lib/data-" + conf.data);
        data.conf = conf;
        var cron = require('cron').CronJob;
        var nodemailer = require("nodemailer");
        var routes = require("./lib/routes");
        routes.data = data;

        var app = express();
        var smtp = nodemailer.createTransport("SMTP", {
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

                data.init(conf, function() {
                        data.populate();
                });
                app.get('/', routes.list);
                app.get('/list', routes.list);
                app.get('/fridge', routes.fridge);
                app.post('/add', routes.add);
                app.get('/del/:name', routes.del);
                app.get('/img/:name', routes.img);
                app.get('/thumb/:name', routes.thumb);
        });

        app.configure('development', function() {
                app.use(express.logger('dev'));
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
