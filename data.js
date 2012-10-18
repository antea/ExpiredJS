// This file contains data access logic.
var dateFormat = require("dateformat");
var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");

// Database initialization
var db;

function init(url, callback) {
        db = new sqlite3.Database(url);
        db.run('create table items (name text primary key, expires char(8), image blob)', callback);
}

function populate(callback) {
        var st = db.prepare("insert into items values(?,?,?)", function() {
                fs.readFile("test/walle.jpg", function(err, image) {
                        for(var i = 0; i < 12; i++) {
                                var date = new Date();
                                date.setMonth(i);
                                st.run("i" + i, dateFormat(date, 'yyyymmdd'), image);
                        };
                        callback && callback();
                });
        });
}

function all(callback) {
        db.all('select * from items order by expires', callback);
}

function del(name, callback) {
        db.prepare('delete from items where name=?').run(name, callback);
}

function count(callback) {
        db.get('select count(*) as c from items', callback);
}

function countByName(name, callback) {
        db.prepare('select count(*) as c from items where name = ?').get(name, callback);
}

function img(name, callback) {
        db.get('select image from items where name = ?', name, callback);
}

// name: string, name of the thing
// expires: Date, expiry date of the object

function add(name, expires, image, callback) {
        countByName(name, function(err, rows) {
                if(0 == rows.c) {
                        db.prepare('insert into items values(?, ?, ?)').
                        run(name, dateFormat(expires, 'yyyymmdd'), image, callback);
                };
        });
}

exports.init = init;
exports.all = all;
exports.del = del;
exports.add = add;
exports.count = count;
exports.populate = populate;
exports.img = img;
