var mongoose = require("mongoose");
var dateFormat = require("dateformat");
var fs = require("fs");
var utils = require("./utils");
// redis.debug_mode = true;
var client;

var ItemSchema = new mongoose.Schema({
        name: String,
        user: String,
        expires: String,
        image: Buffer,
        thumbnail: Buffer
});
var Item;

exports.init = function(conf, callback) {
        client = mongoose.createConnection(conf.mongodb_url);
        client.on("error", console.error.bind(console, "Connection error:"));
        client.once("open", callback);
        Item = client.model('Item', ItemSchema);
}

//callback: function(err)
function clean(user, callback) {
        Item.where('user', user).remove(callback);
}

exports.close = function(callback) {
        mongoose.disconnect();
}

exports.populate = function(callback) {
        console.log('data-mongodb populate');
        fs.readFile("test/walle.jpg", function(err, image) {
                fs.readFile("test/walles.jpg", function(err2, thumbnail) {
                        for(var i = 0; i < 12; i++) {
                                var date = utils.formatYYYYMMDD(new Date().setMonth(i));
                                var item = new Item({
                                        name: 'i'+i,
                                        user: user,
                                        expires: date,
                                        image: image,
                                        thumbnail: thumbnail
                                });
                                item.save();
                        };
                        callback && callback();
                });
        });
}

// callback: function(err, [{user, name, expires}])
exports.all = function(user, callback) {
        Item.where('user', user).sort('expires').exec(callback);
}

exports.nextdays = function(user, days, callback) {
        var today = new Date();
        var future = new Date();
        future.setDate(today.getDate() + days);
        Item.where('expires').gte(utils.formatYYYYMMDD(today)).lte(utils.formatYYYYMMDD(future)).exec(callback);
}

//callback: function()
exports.del = function(user, name, callback) {
        Item.remove({
                user: user,
                name: name
        }, callback);
}

//callback: function(err, count)
exports.count = function(user, callback) {
        Item.where('user', user).count(callback);
}

//callback:function(err, buffer)
exports.img = function(user, name, callback) {
//        console.log('img(user='+user+', name='+name+')')
        Item.findOne({
                user: user,
                name: name
        }, function(err, item) {
                callback && callback(err, item && item.toObject().image.buffer);
        });
}

//callback: function(err, buffer)
exports.thumbnail = function(user, name, callback) {
//        console.log('thumbnail(user='+user+', name='+name+')')
        Item.findOne({
                user: user,
                name: name}, function(err, item) {
//                console.log('thumbnail='+item.toObject().thumbnail.buffer)
                callback && callback(err, item && item.toObject().thumbnail.buffer);
        });
}

// name: string, name of the thing
// expires: Date, expiry date of the object
// callback: function()
exports.add = function(user, name, expires, image, thumbnail, callback) {
//        console.log('user: ' + user + ', name: ' + name + ', expires: ' + expires + ', image: ' + thumbnail);
        var item = new Item({
                name: name,
                user: user,
                expires: utils.formatYYYYMMDD(expires),
                image: image,
                thumbnail: thumbnail
        });
        item.save(callback);
}

exports.clean = clean;
