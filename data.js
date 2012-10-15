// This file contains data access logic.
var dateFormat = require("dateformat");
var sqlite3 = require("sqlite3").verbose();

// Database initialization
var db;

function init(url, callback) {
        db = new sqlite3.Database(url);
        db.run('create table items (name text primary key, expires char(8))', function() {
                var st = db.prepare("insert into items values(?,?)", function() {
                        for(var i = 0; i < 12; i++) {
                                var date = new Date();
                                date.setMonth(i);
                                st.run("Item " + i, dateFormat(date, 'yyyymmdd'));
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

// name: string, name of the thing
// expires: Date, expiry date of the object

function add(name, expires, callback) {
        db.prepare('insert into items values(?, ?)').run(name, dateFormat(expires, 'yyyymmdd'), callback);
}

exports.init = init;
exports.all = all;
exports.del = del;
exports.add = add;
exports.count = count;
