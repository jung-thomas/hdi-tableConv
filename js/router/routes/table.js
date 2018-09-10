/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0 */
/*eslint-env node, es6 */
"use strict";

function getTableInt(tableOid, client, callback) {
	var query =
		`SELECT * from TABLES
		  WHERE TABLE_OID = ? `;
	client.prepare(
		query,
		(err, statement) => {
			statement.exec([tableOid],
				(err, results) => {
					if (err) {
						callback(err);
					} else {
						var out = [];
						for (let result of results) {
							out.push(result);
						}
						callback(null, out);
					}
				});
		});
}

module.exports = {
	getTable: (tableOid, client, callback) => {
		getTableInt(tableOid, client, callback);
	},

	router: () => {
		var app = require("express").Router();
		app.get("/:tableOid", (req, res) => {
			getTableInt(req.params.tableOid, req.db, (err, results) => {
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