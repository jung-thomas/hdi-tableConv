/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, consistent-return: 0, new-cap: 0*/
"use strict";

function getConstraintsInt(schema, table, client, callback) {

	if (typeof schema === "undefined" || schema === null) {
		callback("Invalid search schema");
		return;
	}
	if (typeof table === "undefined" || table === null) {
		callback("Invalid search table");
		return;
	}

	var query = 'SELECT * from CONSTRAINTS ' +
		' WHERE SCHEMA_NAME = ? ' +
		'   AND TABLE_NAME = ? ' +
		'   AND IS_PRIMARY_KEY = ? ' +
		' ORDER BY POSITION ';
	client.prepare(
		query,
		function(err, statement) {
			statement.exec([schema, table, 'TRUE'],
				function(err, results) {
					if (err) {
						callback(err);
					} else {
						var out = [];
						for (var i = 0; i < results.length; i++) {
							out.push(results[i]);
						}
						callback(null, out);
					}
				});
		});
}

module.exports = {
	getConstraints: function(schema, table, client, callback) {
		getConstraintsInt(schema, table, client, callback);
	},

	router: function() {
		var app = require("express").Router();
		app.get("/:schema?/:table?", function(req, res) {
			getConstraintsInt(req.params.schema, req.params.table, req.db, function(err, results) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err);
				} else {
					require(global.__base + "utils/json").outputJSON(results, res);
				}
			});
		});

		return app;
	}

};