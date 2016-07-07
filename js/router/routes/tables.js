/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, consistent-return: 0, new-cap: 0*/
"use strict";

function getTablesInt(schema, table, client, limit, callback) {
	if (typeof table === "undefined" || table === null) {
		table = "%";
	} else {
		table += "%";
	}

	var query = 'SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES ' +
		' WHERE SCHEMA_NAME = ? ' +
		'   AND TABLE_NAME LIKE ? ' +
		' ORDER BY TABLE_NAME ';
	if (limit != null) {
		query += 'LIMIT ' + limit.toString();
	}
	client.prepare(
		query,
		function(err, statement) {
			statement.exec([schema, table],
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
	getTables: function(schema, table, client, limit, callback) {
		getTablesInt(schema, table, client, limit, callback);
	},

	router: function() {
		var app = require("express").Router();
		app.get("/:schema/:table?", function(req, res) {
			getTablesInt(req.params.schema, req.params.table, req.db, 200, function(err, results) {
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