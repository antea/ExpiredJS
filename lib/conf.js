var fs = require("fs");

exports.conf = function(callback) {
        fs.readFile('./expiredjs.conf', 'utf8', function(err, confdata) {
                var conf = JSON.parse(confdata);
                callback(conf);
        });
}
