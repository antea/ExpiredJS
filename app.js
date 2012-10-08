var express = require("express");
var formidable = require("formidable");
var fs = require("fs");
var jade = require("jade");
var path = require("path");

function start(request, response) {
        console.log("Request handler 'start' was called.");
        response.render('start.jade');
}

function upload(request, response) {
        console.log("Request handler 'upload' was called.");
        console.log('About to parse...');
        console.log(request);
        var form = new formidable.IncomingForm();
        form.parse(request, function(error, fields, files) {
                console.log('Parsing done.');
                fs.rename(files.upload.path, "/tmp/test.png", function(err) {
                        if(err) {
                                fs.unlink("/tmp/test.png");
                                fs.rename(files.upload.path, "/tmp/test.png");
                        }
                });
                response.render('upload.jade');
        });
}

function show(request, response) {
        console.log("Request handler 'show' was called.");
        fs.readFile("/tmp/test.png", "binary", function(error, file) {
                if(error) {
                        response.writeHead(500, {
                                "Content-Type": "text/plain"
                        });
                        response.write(err + "\n");
                } else {
                        response.writeHead(200, {
                                "Content-Type": "image/png"
                        });
                        response.write(file, "binary");
                }
                response.end();
        });
}


var app = express();

app.configure(function() {
        app.set('port', process.env.PORT || 8888);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use(express.favicon());
        app.use(express.logger('dev'));
        //        app.use(express.bodyParser());
        //        app.use(express.methodOverride());
        //        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
});

console.log("Application is listening on port 8888 (with express).")
app.get('/', start);
app.get('/start', start);
app.post('/upload', upload);
app.get('/show', show);

app.listen(8888);
