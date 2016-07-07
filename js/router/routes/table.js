/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, consistent-return: 0, new-cap: 0*/
"use strict";

function getTableInt(tableOid, client, callback) {
	var query = 'SELECT * from TABLES ' +
		' WHERE TABLE_OID = ? ';
	client.prepare(
		query,
		function(err, statement) {
			statement.exec([tableOid],
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
	getTable: function(tableOid, client, callback) {
		getTableInt(tableOid, client, callback);
	},

	router: function() {
		var app = require("express").Router();
		app.get("/:tableOid", function(req, res) {
			getTableInt(req.params.tableOid, req.db, function(err, results) {
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