var path = require("path");
var im = require("imagemagick");
var fs = require("fs");
var data = require("./data-redis");
var utils = require("./utils");

exports.add = function(request, response) {
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

exports.list = function(request, response) {
        response.render('list.jade');
}

function fridge(request, response) {
        data.all(function(err, rows) {
                // console.log(rows);
                response.render('fridge.jade', {
                        rows: rows,
                        reparse: utils.reparse
                });
        });
}

exports.del = function(request, response) {
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

exports.img = function(request, response) {
        data.img(request.params.name, function(err, image) {
                sendImageOrBlank(image, response);
        });
}

exports.thumb = function(request, response) {
        data.thumbnail(request.params.name, function(err, image) {
                console.log(image);
                sendImageOrBlank(image, response);
        });
}

exports.fridge = fridge;
