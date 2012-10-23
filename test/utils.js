var utils = require("../lib/utils.js");
var nodeunit = require("nodeunit");
require("should");

module.exports = nodeunit.testCase({
	'reparse a good string': function(test) {
		utils.reparse('20120101').should.eql("January 1st 2012");
		// console.log('done');
		test.done();
	}
})