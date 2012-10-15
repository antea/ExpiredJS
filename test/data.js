var data = require("../data");
var nodeunit = require("nodeunit");
require("should");
var Step = require("step");

exports['data'] = nodeunit.testCase({
        setUp: function(callback) {
                data.init(':memory:', callback);
        },
        'count empty fridge': function(test) {
                data.count(function(err, rows) {
                        rows.c.should.be.eql(0);
                        test.done();
                });
        },
        'count 1 item in the fridge': function(test) {
                Step(

                function() {
                        data.add('Item1', new Date(), this);
                }, function() {
                        data.count(function(err, rows) {
                                rows.c.should.be.eql(1);
                                test.done();
                        });
                });
        },
        'count 2 items in the fridge': function(test) {
                Step(

                function() {
                        data.add('Item1', new Date(), this);
                }, function() {
                        data.add('Item2', new Date(), this);
                }, function() {
                        data.count(function(err, rows) {
                                rows.c.should.be.eql(2);
                                test.done();
                        });
                });
        },
        'insert duplicate item': function(test) {
                Step(

                function() {
                        data.add('Item1', new Date(), this);
                }, function() {
                        data.add('Item1', new Date(), this);
                });
                test.done();
        }
})