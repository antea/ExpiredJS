var data = require("../data-sqlite3");
var nodeunit = require("nodeunit");
require("should");
var Step = require("step");
var fs = require("fs");
var assert = require("assert");

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
        'add an item with a picture': function(test) {
                fs.readFile('test/walle.jpg', function(err, image) {
                        data.add('Item Walle', new Date(), image, null, function() {
                                // console.log('1: ' + image);
                                data.img('Item Walle', function(err, retreived) {
                                        // console.log('2: ' + retreived);
                                        assert.ok(retreived, 'Spiegami retreived...');
                                        test.done();
                                });
                        });
                });
        },
        'count 1 item in the fridge': function(test) {
                Step(

                function() {
                        data.add('Item1', new Date(), null, null, this);
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
                        data.add('Item1', new Date(), null, null, this);
                }, function() {
                        data.add('Item2', new Date(), null, null, this);
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
                        data.add('Item1', new Date(), null, null, this);
                }, function() {
                        data.add('Item1', new Date(), null, null, this);
                });
                test.done();
        }
})
