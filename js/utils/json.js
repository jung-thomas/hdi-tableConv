/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";

/**
@function Puts a JSON object into the Response Object
@param {object} jsonOut - JSON Object
*/
module.exports = {
	outputJSON: function(jsonOut, res) {
		var out = [];
		for (var i = 0; i < jsonOut.length; i++) {
			out.push(jsonOut[i]);
		}
		res.type("application/json").status(200).send(JSON.stringify(out));
		return;
	}
};