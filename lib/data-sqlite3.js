// This file contains data access logic.
var dateFormat = require("dateformat");
var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");
var utils = require("./utils");

// Database initialization
var db;

exports.init = function(conf, callback) {
        db = new sqlite3.Database(conf.sqlite3_url);
        db.run('create table items (name text primary key, user text, expires char(8), image blob, thumbnail blob)', callback);
}

exports.populate = function(callback) {
        var st = db.prepare("insert into items values(?,?,?,?)", function() {
                fs.readFile("test/walle.jpg", function(err, image) {
                        fs.readFile("test/walles.jpg", function(err2, thumbnail) {
                                for(var i = 0; i < 12; i++) {
                                        var date = new Date();
                                        date.setMonth(i);
                                        st.run("i" + i, utils.formatYYYYMMDD(date), image, thumbnail);
                                };
                                callback && callback();
                        });
                });
        });
}

exports.all = function(user, callback) {
        db.all('select * from items where user = ? order by expires', user, callback);
}

exports.nextdays = function(user, days, callback) {
        var today = new Date();
        var future = new Date();
        future.setDate(today.getDate() + days);
        db.all('select * from items where user = ? and expires > ? and expires < ? order by expires', user, utils.formatYYYYMMDD(today), utils.formatYYYYMMDD(future), callback);
}

exports.del = function(user, name, callback) {
        db.prepare('delete from items where user=? and name=?').run(user, name, callback);
}

exports.count = function(user, callback) {
        db.get('select count(*) as c from items where user=?', user, function(err, rows) {
                err && console.log(err);
                callback(err, rows.c);
        });
}

function countByName(user, name, callback) {
        db.prepare('select count(*) as c from items where user=? and name = ?').
        get(user, name, function(err, rows) {
                callback(err, rows.c);
        });
}

exports.img = function(user, name, callback) {
        db.get('select image from items where user=? and name = ?', user, name, function(err, rows) {
                callback(err, rows.image);
        });
}

exports.thumbnail = function(user, name, callback) {
        db.get('select thumbnail from items where user=? and name = ?', user, name, function(err, rows) {
                callback(err, rows.thumbnail);
        });
}

// name: string, name of the thing
// expires: Date, expiry date of the object
exports.add = function(user, name, expires, image, thumbnail, callback) {
        countByName(user, name, function(err, c) {
                // console.log(c);
                if(0 === c) {
                        db.prepare('insert into items values(?,?,?,?,?)').
                        run(name, user, dateFormat(expires, 'yyyymmdd'), image, thumbnail, callback);
                } else {
                        callback && callback();
                }
        });
}

exports.countByName = countByName;
