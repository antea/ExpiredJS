var data = require("../data");
var nodeunit = require("nodeunit");
require("should");

exports['data'] = nodeunit.testCase({
        setUp: function(callback) {
                data.init(':memory:', callback);
        },
        'count items in the fridge': function(test) {
                data.count(function(err, rows) {
                        console.log(rows);
                        rows.c.should.be.eql(12);
                        test.done();
                });
        }
})
