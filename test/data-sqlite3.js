var data = require("../lib/data-sqlite3");
var nodeunit = require("nodeunit");
require("should");
var Step = require("step");
var fs = require("fs");
var assert = require("assert");
var user = 'tesatuser';

exports['sqlite3'] = nodeunit.testCase({
        setUp: function(callback) {
                data.init({
                        sqlite3_url: ':memory:'
                }, function(err, res) {
                        // err && console.log(err);
                        // res && console.log(res);
                        // console.log('setUp done');
                        callback();
                });
                // console.log('setUp');
        },
        'insert duplicate item': function(test) {
                // console.log('adding first');
                data.add(user, 'Item1', new Date(), null, null, function() {
                        // console.log('adding second');
                        data.add(user, 'Item1', new Date(), null, null, function() {
                                // console.log('done');
                                test.done();
                        });
                });
        },
        'add an item with a picture': function(test) {
                // console.log('1');
                fs.readFile('test/walle.jpg', function(err, image) {
                        // console.log('2');
                        data.add(user, 'Item Walle', new Date(), image, null, function() {
                                // console.log('1: ' + image);
                                data.img(user, 'Item Walle', function(err, retreived) {
                                        // console.log('2: ' + retreived);
                                        assert.ok(retreived, 'Spiegami retreived...');
                                        // console.log('done');
                                        test.done();
                                });
                        });
                });
        },
        'count empty fridge': function(test) {
                data.count(user, function(err, c) {
                        c.should.be.eql(0);
                        // console.log('done');
                        test.done();
                });
        },
        'count 1 item in the fridge': function(test) {
                Step(

                function() {
                        // console.log('1');
                        data.add(user, 'Item1', new Date(), null, null, this);
                }, function() {
                        // console.log('2');
                        data.count(user, function(err, c) {
                                // console.log('3');
                                c.should.be.eql(1);
                                // console.log('done');
                                test.done();
                        });
                });
        },
        'count 2 items in the fridge': function(test) {
                Step(

                function() {
                        data.add(user, 'Item1', new Date(), null, null, this);
                }, function() {
                        data.add(user, 'Item2', new Date(), null, null, this);
                }, function() {
                        data.count(user, function(err, c) {
                                c.should.be.eql(2);
                                // console.log('done');
                                test.done();
                        });
                });
        }
})
