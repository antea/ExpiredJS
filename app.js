var express = require("express");
var formidable = require("formidable");
var fs = require("fs");

function start(request, response) {
        console.log("Request handler 'start' was called.");

        var body = '<html><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/></head>' + '<body>' + '<form action="/upload" enctype="multipart/form-data" method="post">' + '<input type="file" name="upload"/>' + '<input type="submit" value="Upload File"/>' + '</form></body></html>';

        response.writeHead(200, {
                "Content-Type": "text/html"
        });
        response.write(body);
        response.end();
}

function upload(request, response) {
        console.log("Request handler 'upload' was called.");

        var form = new formidable.IncomingForm();
        console.log('About to parse...');
        form.parse(request, function(error, fields, files) {
                console.log('Parsing done.');
                fs.rename(files.upload.path, "/tmp/test.png", function(err) {
                        if(err) {
                                fs.unlink("/tmp/test.png");
                                fs.rename(files.upload.path, "/tmp/test.png");
                        }
                });
                response.writeHead(200, {
                        "Content-Type": "text/html"
                });
                response.write('Received image:<br>');
                response.write('<img src="/show"/>');
                response.end();
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
                        response.end();
                } else {
                        response.writeHead(200, {
                                "Content-Type": "image/png"
                        });
                        response.write(file, "binary");
                        response.end();
                }
        });
}


(function() {
        var app = express();
        app.listen(8888);
        console.log("Application is listening on port 8888 (with express).")
        app.get('/', start);
        app.get('/start', start);
        app.post('/upload', upload);
        app.get('/show', show);
})();
