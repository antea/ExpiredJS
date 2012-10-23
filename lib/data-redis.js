var redis = require("redis");
var dateFormat = require("dateformat");
// redis.debug_mode = true;
var user = "chiccorusso@gmail.com";
var client;

function clean() {
        client.zremrangebyrank('z_' + user, 0, 99999999);
}

exports.init = function(conf, callback) {
        client = redis.createClient();
        client.on("error", function(err) {
                console.log("Error " + err);
        });
        client.on("connect", function() {
                // console.log("Redis client connected");
                // console.log(client.server_info);
                callback && callback();
        });
}

exports.populate = function(callback) {
        console.log('data-redis populate');
        fs.readFile("test/walle.jpg", function(err, image) {
                fs.readFile("test/walles.jpg", function(err2, thumbnail) {
                        for(var i = 0; i < 12; i++) {
                                var date = new Date();
                                date.setMonth(i);
                                client.zadd('z_' + user, utils.formatYYYYMMDD(date), 'i' + i, function(err) {});
                                client.hset('h_' + user, 'i' + i + 'image', image, function() {});
                                client.hset('h_' + user, 'i' + i + 'thumbnail', thumbnail, function() {});
                        };
                        callback && callback();
                });
        });
}

exports.all = function(callback) {
        client.zrangebyscore('z_' + user, "-inf", "+inf", function(err, resp) {
                console.log(resp);
                callback(err, resp);
        });
}

exports.nextdays = function(days, callback) {
        var today = new Date();
        var future = new Date();
        future.setDate(today.getDate() + days);
        db.all('select * from items where expires > ? and expires < ? order by expires', utils.formatYYYYMMDD(today), utils.formatYYYYMMDD(future), callback);
}

exports.del = function(name, callback) {
        client.hdel('h_' + user, name + 'image', name + 'thumbnail', function() {});
        client.zrem('z_' + user, name, callback);
}

exports.count = function(callback) {
        client.zcard('z_' + user, callback);
}

exports.img = function(name, callback) {
        client.hget('h_' + user, name + 'image', callback);
}

exports.thumbnail = function(name, callback) {
        client.hget('h_' + user, name + 'thumbnail', callback);
}

// name: string, name of the thing
// expires: Date, expiry date of the object
exports.add = function(name, expires, image, thumbnail, callback) {
        client.hset('h_' + user, name + 'image', image, function() {});
        client.hset('h_' + user, name + 'thumbnail', thumbnail, function() {});
        client.zadd('z_' + user, dateFormat(expires, 'yyyymmdd'), name, callback);
}

exports.clean = clean;
