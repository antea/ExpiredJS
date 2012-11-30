var configure = require("./lib/conf").conf;
var passport = require("passport");

configure(function(conf) {
        var fs = require("fs");
        var path = require("path");
        var express = require("express");
        var jade = require("jade");
        var http = require("http");
        var data = require("./lib/data-" + conf.data);
        var cron = require('cron').CronJob;
        var nodemailer = require("nodemailer");
        var routes = require("./lib/routes");
        routes.init(data);

        // passport configuration
        passport.serializeUser(function(user, done) {
                //                console.log('serializeUser');
                //                console.log(user);
                done(null, user.id);
        });

        passport.deserializeUser(function(id, done) {
                //                console.log('deserializing: ' + id);
                done(null, {
                        id: id
                });
        });

        var TwitterStrategy = require('passport-twitter').Strategy;
        passport.use(new TwitterStrategy({
                consumerKey: '2bXbSZbZ4SFUc2fPsfpqLQ',
                consumerSecret: 'Bmqxu7ZkCdUG63guBbFp16EPp4b47NNzhdBl0UDmJw',
                callbackURL: conf.url + "auth/twitter/callback"
        }, function(token, tokenSecret, profile, done) {
                //                console.log('token: ' + token);
                //                console.log('tokenSecret: ' + tokenSecret);
                //                console.log('profile: ');
                //                console.log(profile);
                done(null, {
                        id: profile.username
                });
        }));
        var GoogleStrategy = require('passport-google').Strategy;
        passport.use(new GoogleStrategy({
                returnURL: conf.url + "auth/google/return",
                realm: conf.url
        }, function(identifier, profile, done) {
                //                console.log('identifier: ' + identifier);
                //                console.log('profile: ');
                //                console.log(profile);
                done(null, {
                        id: profile.displayName
                });
        }));
        var DropboxStrategy = require('passport-dropbox').Strategy;
        passport.use(new DropboxStrategy({
                consumerKey: 'isxve2drfie94o4',
                consumerSecret: 'duqnu0cq0jehzc3',
                callbackURL: conf.url + "auth/dropbox/callback"
        }, function(token, tokenSecret, profile, done) {
                //                console.log('token: ' + token);
                //                console.log('tokenSecret: ' + tokenSecret);
                //                console.log('profile: ');
                //                console.log(profile);
                done(null, {
                        id: profile.displayName
                });
        }));
        var GitHubStrategy = require('passport-github').Strategy;
        passport.use(new GitHubStrategy({
                clientID: '9a3e990becb45b35cb28',
                clientSecret: 'e9bdeab8b45bbf7565ddf0f0511bf0c049bee122',
                callbackURL: conf.url + "auth/github/callback"
        }, function(accessToken, refreshToken, profile, done) {
                //                console.log('token: ' + token);
                //                console.log('tokenSecret: ' + tokenSecret);
                //                console.log('profile: ');
                //                console.log(profile);
                done(null, {
                        id: profile.displayName
                });
        }));


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
                app.use(express.static(path.join(__dirname, 'public')));
                app.use(express.favicon(path.join(__dirname, '/public/images/favicon.ico')));
                app.use(express.cookieParser('segretissimo'));
                app.use(express.session());
                app.use(passport.initialize());
                app.use(passport.session());
                //        app.use(express.methodOverride());
                //        app.use(app.router);
                app.use(express.errorHandler());

                data.init(conf, function() {
                        //data.populate();
                });
                app.get('/', routes.list);
                app.get('/list', routes.list);
                app.get('/fridge', routes.fridge);
                app.post('/add', routes.add);
                app.get('/del/:name', routes.del);
                app.get('/img/:name', routes.img);
                app.get('/thumb/:name', routes.thumb);
                app.get('/logout', function(req, res) {
                        req.logout();
                        res.redirect('/');
                });
                // Redirect the user to Twitter for authentication.  When complete, Twitter
                // will redirect the user back to the application at
                //   /auth/twitter/callback
                app.get('/auth/twitter', passport.authenticate('twitter'));

                // Twitter will redirect the user to this URL after approval.  Finish the
                // authentication process by attempting to obtain an access token.  If
                // access was granted, the user will be logged in.  Otherwise,
                // authentication has failed.
                app.get('/auth/twitter/callback', passport.authenticate('twitter', {
                        successRedirect: '/',
                        failureRedirect: '/login'
                }));
                // Redirect the user to Google for authentication.  When complete, Google
                // will redirect the user back to the application at
                //     /auth/google/return
                app.get('/auth/google', passport.authenticate('google'));

                // Google will redirect the user to this URL after authentication.  Finish
                // the process by verifying the assertion.  If valid, the user will be
                // logged in.  Otherwise, authentication has failed.
                app.get('/auth/google/return', passport.authenticate('google', {
                        successRedirect: '/',
                        failureRedirect: '/login'
                }));
                app.get('/auth/dropbox', passport.authenticate('dropbox'), function(req, res) {
                        // The request will be redirected to Dropbox for authentication, so this
                        // function will not be called.
                });

                app.get('/auth/dropbox/callback', passport.authenticate('dropbox', {
                        failureRedirect: '/login'
                }), function(req, res) {
                        // Successful authentication, redirect home.
                        res.redirect('/');
                });
                app.get('/auth/github', passport.authenticate('github'), function(req, res) {
                        // The request will be redirected to GitHub for authentication, so this
                        // function will not be called.
                });
                app.get('/auth/github/callback', passport.authenticate('github', {
                        failureRedirect: '/login'
                }), function(req, res) {
                        // Successful authentication, redirect home.
                        res.redirect('/');
                });
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
