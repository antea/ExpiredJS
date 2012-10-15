// This file contains data access logic.
var sqlite3 = require("sqlite3").verbose();

// Database initialization
var db;

function init(app) {
        app.configure('development', function() {
                db = new sqlite3.Database(app.get('db_url'));
                db.run('create table items (name text, expires datetime)', function() {
                        var st = db.prepare("insert into items values(?,?)", function() {
                                for(var i = 10; i >= 0; i--) {
                                        var date = new Date();
                                        date.setMonth(i);
                                        st.run("Item " + i, date);
                                }
                        });
                });
        });
}

function all(callback) {
        db.all('select * from items order by expires', callback);
}

function del(name, callback) {
        db.prepare('delete from items where name=?').run(name, callback);
}

function add(name, expires, callback) {
        db.prepare('insert into items values(?, ?)').run(name, expires, callback);
}

exports.init = init;
exports.all = all;
exports.del = del;
exports.add=add;
