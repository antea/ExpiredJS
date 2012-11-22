var redis = require("redis");
var dateFormat = require("dateformat");
var fs = require("fs");
var utils = require("./utils");
// redis.debug_mode = true;
var client;

function clean(user, callback) {
        client.zremrangebyrank('z_' + user, 0, 99999999, callback);
}

exports.init = function(conf, callback) {
        client = redis.createClient(null, null, {
                return_buffers: true
        });
        client.on("error", function(err) {
                console.log("Error " + err);
        });
        client.on("connect", function() {
                // console.log("Redis client connected");
                // console.log(client.server_info);
                callback && callback();
        });
}

exports.close = function(callback) {
        client.quit(callback);
}

exports.populate = function(callback) {
        console.log('data-redis populate');
        fs.readFile("test/walle.jpg", function(err, image) {
                fs.readFile("test/walles.jpg", function(err2, thumbnail) {
                        for(var i = 0; i < 12; i++) {
                                var date = utils.formatYYYYMMDD(new Date().setMonth(i));
                                client.zadd('z_' + user, date, {
                                        expires: date,
                                        name: 'i' + i
                                }, function(err) {});
                                client.hset('h_' + user, 'i' + i + 'image', image, function() {});
                                client.hset('h_' + user, 'i' + i + 'thumbnail', thumbnail, function() {});
                        };
                        callback && callback();
                });
        });
}

exports.all = function(user, callback) {
        client.zrangebyscore('z_' + user, "-inf", "+inf", function(err, resp) {
                console.log('resp: ' + resp);
                // var result = [];
                // for(var i = 0; i < resp.length; i++) {
                //         // console.log(resp[i]);
                //         result.push({
                //                 name: resp[i].slice(8, 999),
                //                 expires: resp[i].slice(0, 7),
                //         });
                // }
                callback(err, resp);
        });
}

exports.nextdays = function(user, days, callback) {
        var today = new Date();
        var future = new Date();
        future.setDate(today.getDate() + days);
        db.all('select * from items where expires > ? and expires < ? order by expires', utils.formatYYYYMMDD(today), utils.formatYYYYMMDD(future), callback);
}

exports.del = function(user, name, callback) {
        client.hdel('h_' + user, name + 'image', name + 'thumbnail', function() {});
        client.zrem('z_' + user, name, callback);
}

exports.count = function(user, callback) {
        client.zcard('z_' + user, callback);
}

exports.img = function(user, name, callback) {
        client.hget('h_' + user, name + 'image', callback);
}

exports.thumbnail = function(user, name, callback) {
        client.hget('h_' + user, name + 'thumbnail', callback);
}

// name: string, name of the thing
// expires: Date, expiry date of the object
exports.add = function(user, name, expires, image, thumbnail, callback) {
        client.hset('h_' + user, name + 'image', image, function() {});
        client.hset('h_' + user, name + 'thumbnail', thumbnail, function() {});
        var date = dateFormat(expires, 'yyyymmdd');
        client.zadd('z_' + user, date, date + name, callback);
}

exports.clean = clean;
