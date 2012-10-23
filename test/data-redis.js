var data = require("../lib/data-redis");
var nodeunit = require("nodeunit");
require("should");
var Step = require("step");
var fs = require("fs");
var assert = require("assert");

exports['redis'] = nodeunit.testCase({
        'setUp': function(callback) {
                // console.log('setup');
                data.init({}, function() {
                        // console.log('setup done');
                        data.clean(callback);
                        // console.log('setUp done');
                        // callback();
                });
        },
        'tearDown': function(callback) {
                data.close(callback);
        },
        'count empty fridge': function(test) {
                // console.log('count empty fridge');
                data.count(function(err, c) {
                        // console.log('** c=' + c);
                        c.should.be.eql(0);
                        // console.log('done');
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
                                        // console.log('done');
                                        test.done();
                                });
                        });
                });
        },
        'count 1 item in the fridge': function(test) {
                data.add('Item1', new Date(), null, null, function() {
                        data.count(function(err, c) {
                                c.should.be.eql(1);
                                // console.log('done');
                                test.done();
                        });
                });
        },
        'count 2 items in the fridge': function(test) {
                data.add('Item1', new Date(), null, null, function() {
                        data.add('Item2', new Date(), null, null, function() {
                                data.count(function(err, c) {
                                        c.should.be.eql(2);
                                        // console.log('done');
                                        test.done();
                                });
                        });
                });
        },
        'insert duplicate item': function(test) {
                data.add('Item1', new Date(), null, null, function() {
                        data.add('Item1', new Date(), null, null, function() {
                                test.done();
                        });
                });
        }
})
