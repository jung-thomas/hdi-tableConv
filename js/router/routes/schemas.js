/*eslint no-console: 0, no-shadow: 0, quotes: 0, consistent-return: 0, new-cap: 0 */
"use strict";

function getSchemasInt(schema, client, limit, callback) {
	if (typeof schema === "undefined" || schema === null) {
		schema = "%";
	} else {
		schema += "%";
	}

	var query = 'SELECT * from SCHEMAS ' +
		' WHERE SCHEMA_NAME LIKE ? ' +
		' ORDER BY SCHEMA_NAME ';
	if (limit != null) {
		query += 'LIMIT ' + limit.toString();
	}
	client.prepare(
		query,
		function(err, statement) {
			statement.exec([schema],
				function(err, results) {
					if (err) {
						callback(err);
					} else {
						callback(null, results);
					}
				});
		});
}

module.exports = {
	getSchemas: function(schema, client, limit, callback) {
		getSchemasInt(schema, client, limit, callback);
	},

	router: function() {
		var app = require("express").Router();
		app.get("/:schema?", function(req, res) {
			getSchemasInt(req.params.schema, req.db, 200, function(err, results) {
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